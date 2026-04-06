const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/favorites — user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: { owner: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.filter((f) => !f.listing.deleted));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/favorites — toggle favorite
router.post('/', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId: parseInt(listingId) } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: req.user.id, listingId: parseInt(listingId) },
    });
    res.json({ favorited: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/favorites/check/:listingId
router.get('/check/:listingId', auth, async (req, res) => {
  try {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: req.user.id, listingId: parseInt(req.params.listingId) },
      },
    });
    res.json({ favorited: !!fav });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
