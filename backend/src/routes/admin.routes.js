const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/admin/stats — dashboard statistics
router.get('/stats', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    // Total revenue from PAID bookings
    const revenueResult = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', deleted: false },
      _sum: { totalPrice: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Monthly revenue (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const paidBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PAID',
        deleted: false,
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { totalPrice: true, createdAt: true },
    });

    const monthlyRevenue = {};
    paidBookings.forEach((b) => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + b.totalPrice;
    });

    const monthlyRevenueArray = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top 5 popular listings (most bookings)
    const topListings = await prisma.listing.findMany({
      where: { deleted: false },
      select: {
        id: true,
        title: true,
        averageRating: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { bookings: { _count: 'desc' } },
      take: 5,
    });

    // Active users (users who booked in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUserIds = await prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, deleted: false },
      select: { userId: true },
      distinct: ['userId'],
    });

    // General counts
    const [totalUsers, totalListings, totalBookings, pendingListings] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { deleted: false } }),
      prisma.booking.count({ where: { deleted: false } }),
      prisma.listing.count({ where: { deleted: false, approved: false } }),
    ]);

    // Users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const usersByMonth = {};
    recentUsers.forEach((u) => {
      const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
      usersByMonth[key] = (usersByMonth[key] || 0) + 1;
    });
    const usersByMonthArray = Object.entries(usersByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalRevenue,
      monthlyRevenue: monthlyRevenueArray,
      topListings: topListings.map((l) => ({
        id: l.id,
        title: l.title,
        bookings: l._count.bookings,
        rating: l.averageRating,
      })),
      activeUsers: activeUserIds.length,
      totalUsers,
      totalListings,
      totalBookings,
      pendingListings,
      usersByMonth: usersByMonthArray,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/logs — audit logs with pagination
router.get('/logs', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
