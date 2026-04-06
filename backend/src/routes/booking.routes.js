const express = require('express');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../utils/auditLog');
const { sendEmail } = require('../utils/email');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/bookings — user's bookings or all (admin)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { deleted: false };
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.id;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true, images: true, location: true, price: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/bookings — create booking
router.post(
  '/',
  auth,
  [
    body('listingId').isInt().withMessage('Listing ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { listingId, startDate, endDate } = req.body;
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date.' });
      }

      const listing = await prisma.listing.findFirst({ where: { id: parseInt(listingId), deleted: false, approved: true } });
      if (!listing) return res.status(404).json({ error: 'Listing not found.' });

      // Check for double booking
      const overlap = await prisma.booking.findFirst({
        where: {
          listingId: parseInt(listingId),
          deleted: false,
          status: { not: 'CANCELLED' },
          OR: [
            { startDate: { lte: end }, endDate: { gte: start } },
          ],
        },
      });
      if (overlap) {
        return res.status(400).json({ error: 'These dates are already booked.' });
      }

      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * listing.price;

      const booking = await prisma.booking.create({
        data: {
          userId: req.user.id,
          listingId: parseInt(listingId),
          startDate: start,
          endDate: end,
          totalPrice,
        },
        include: {
          listing: { select: { title: true } },
        },
      });

      await createAuditLog({ userId: req.user.id, action: 'CREATE_BOOKING', entity: 'Booking', entityId: booking.id });

      await sendEmail({
        to: req.user.email,
        subject: 'Booking Confirmation — HomeRent',
        html: `<h2>Booking Created</h2><p>Your booking for <strong>${booking.listing.title}</strong> has been created. Total: $${totalPrice}.</p>`,
      });

      res.status(201).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// PATCH /api/bookings/:id/status — update booking status (admin)
router.patch('/:id/status', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { user: { select: { email: true } }, listing: { select: { title: true } } },
    });

    await createAuditLog({ userId: req.user.id, action: 'UPDATE_BOOKING_STATUS', entity: 'Booking', entityId: id, details: `Status: ${status}` });

    await sendEmail({
      to: booking.user.email,
      subject: `Booking ${status} — HomeRent`,
      html: `<h2>Booking ${status}</h2><p>Your booking for <strong>${booking.listing.title}</strong> is now <strong>${status}</strong>.</p>`,
    });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/bookings/:id/pay — fake payment
router.patch('/:id/pay', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Already paid.' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      include: { listing: { select: { title: true } }, user: { select: { email: true } } },
    });

    await createAuditLog({ userId: req.user.id, action: 'PAYMENT', entity: 'Booking', entityId: id, details: 'Fake payment processed' });

    await sendEmail({
      to: updated.user.email,
      subject: 'Payment Confirmed — HomeRent',
      html: `<h2>Payment Successful</h2><p>Your payment for <strong>${updated.listing.title}</strong> has been confirmed. Amount: $${booking.totalPrice}.</p>`,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/bookings/:id/cancel — cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await createAuditLog({ userId: req.user.id, action: 'CANCEL_BOOKING', entity: 'Booking', entityId: id });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/bookings/:id — soft delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    await prisma.booking.update({ where: { id }, data: { deleted: true } });

    await createAuditLog({ userId: req.user.id, action: 'DELETE_BOOKING', entity: 'Booking', entityId: id });

    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
