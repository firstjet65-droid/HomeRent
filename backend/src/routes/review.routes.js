const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../utils/auditLog');
const { recalcListingRating } = require('../utils/rating');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/reviews?listingId=X
router.get('/', async (req, res) => {
  try {
    const listingId = parseInt(req.query.listingId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = listingId ? { listingId } : {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/reviews
router.post(
  '/',
  auth,
  [
    body('listingId').isInt().withMessage('Listing ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { listingId, rating, comment } = req.body;

      const existing = await prisma.review.findUnique({
        where: { userId_listingId: { userId: req.user.id, listingId: parseInt(listingId) } },
      });
      if (existing) {
        return res.status(400).json({ error: 'You already reviewed this listing.' });
      }

      const review = await prisma.review.create({
        data: {
          userId: req.user.id,
          listingId: parseInt(listingId),
          rating: parseInt(rating),
          comment,
        },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      });

      // Recalculate listing rating
      await recalcListingRating(parseInt(listingId));

      await createAuditLog({ userId: req.user.id, action: 'CREATE_REVIEW', entity: 'Review', entityId: review.id });

      res.status(201).json(review);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// DELETE /api/reviews/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate listing rating
    await recalcListingRating(review.listingId);

    await createAuditLog({ userId: req.user.id, action: 'DELETE_REVIEW', entity: 'Review', entityId: id });

    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
