const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../utils/auditLog');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/listings — public, with search, sort, geo, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 999999;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const propertyType = ['APARTMENT', 'HOUSE'].includes(req.query.propertyType)
      ? req.query.propertyType
      : null;
    const amenities = req.query.amenities ? req.query.amenities.split(',') : [];

    // Geo search params
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 50; // km

    const where = {
      deleted: false,
      approved: true,
      price: { gte: minPrice, lte: maxPrice },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (amenities.length > 0) {
      where.amenities = { hasEvery: amenities };
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    const validSort = ['price', 'createdAt', 'averageRating'].includes(sortBy) ? sortBy : 'createdAt';
    const validOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    let [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [validSort]: validOrder },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Geo filtering (Haversine approximation) — filter in-memory after DB query
    if (!isNaN(lat) && !isNaN(lng)) {
      listings = listings.filter((l) => {
        if (l.lat == null || l.lng == null) return false;
        const R = 6371; // km
        const dLat = ((l.lat - lat) * Math.PI) / 180;
        const dLng = ((l.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) * Math.cos((l.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return dist <= radius;
      });
      total = listings.length;
    }

    res.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/listings/all — admin: all listings including unapproved
router.get('/all', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const where = { deleted: false };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/listings/my — user's own listings
router.get('/my', auth, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: req.user.id, deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const listing = await prisma.listing.findFirst({
      where: { id, deleted: false },
      include: {
        owner: { select: { id: true, name: true, avatar: true, email: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/listings
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be positive'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('propertyType').optional().isIn(['APARTMENT', 'HOUSE']).withMessage('Invalid property type'),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        location,
        lat,
        lng,
        images,
        amenities,
        propertyType,
      } = req.body;

      const listing = await prisma.listing.create({
        data: {
          title,
          description,
          propertyType: propertyType === 'HOUSE' ? 'HOUSE' : 'APARTMENT',
          price: parseFloat(price),
          location,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          images: images || [],
          amenities: amenities || [],
          ownerId: req.user.id,
          approved: req.user.role === 'ADMIN',
        },
      });

      await createAuditLog({ userId: req.user.id, action: 'CREATE_LISTING', entity: 'Listing', entityId: listing.id });

      res.status(201).json(listing);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// PUT /api/listings/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const data = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.description) data.description = req.body.description;
    if (req.body.price) data.price = parseFloat(req.body.price);
    if (req.body.location) data.location = req.body.location;
    if (req.body.lat !== undefined) data.lat = req.body.lat ? parseFloat(req.body.lat) : null;
    if (req.body.lng !== undefined) data.lng = req.body.lng ? parseFloat(req.body.lng) : null;
    if (req.body.images) data.images = req.body.images;
    if (req.body.amenities) data.amenities = req.body.amenities;
    if (req.body.propertyType !== undefined && ['APARTMENT', 'HOUSE'].includes(req.body.propertyType)) {
      data.propertyType = req.body.propertyType;
    }

    const updated = await prisma.listing.update({ where: { id }, data });

    await createAuditLog({ userId: req.user.id, action: 'UPDATE_LISTING', entity: 'Listing', entityId: id });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/listings/:id — soft delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    await prisma.listing.update({ where: { id }, data: { deleted: true } });

    await createAuditLog({ userId: req.user.id, action: 'DELETE_LISTING', entity: 'Listing', entityId: id });

    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/listings/:id/approve — admin only
router.patch('/:id/approve', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { approved } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: { approved: approved !== false },
    });

    await createAuditLog({ userId: req.user.id, action: approved !== false ? 'APPROVE_LISTING' : 'DENY_LISTING', entity: 'Listing', entityId: id });

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
