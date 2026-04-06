const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAuditLog = async ({ userId, action, entity, entityId, details }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { createAuditLog };
