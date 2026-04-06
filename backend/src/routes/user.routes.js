const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createAuditLog } = require('../utils/auditLog');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/users — admin: list all users with pagination
router.get('/', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, status: true, avatar: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, status: true, avatar: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/users/:id — update profile
router.put(
  '/:id',
  auth,
  [body('name').optional().trim().notEmpty()],
  validate,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (req.user.role !== 'ADMIN' && req.user.id !== id) {
        return res.status(403).json({ error: 'Forbidden.' });
      }

      const data = {};
      if (req.body.name) data.name = req.body.name;
      if (req.body.avatar !== undefined) data.avatar = req.body.avatar;
      if (req.body.password) data.password = await bcrypt.hash(req.body.password, 10);

      const user = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, status: true, avatar: true },
      });

      await createAuditLog({ userId: req.user.id, action: 'UPDATE_USER', entity: 'User', entityId: id });

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// DELETE /api/users/:id — admin only
router.delete('/:id', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });

    await createAuditLog({ userId: req.user.id, action: 'DELETE_USER', entity: 'User', entityId: id });

    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/users/:id/role — admin only
router.patch('/:id/role', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await createAuditLog({ userId: req.user.id, action: 'CHANGE_ROLE', entity: 'User', entityId: id, details: `Role changed to ${role}` });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/users/:id/status — admin only
router.patch('/:id/status', auth, roleGuard('ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await createAuditLog({ userId: req.user.id, action: 'CHANGE_STATUS', entity: 'User', entityId: id, details: `Status changed to ${status}` });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
