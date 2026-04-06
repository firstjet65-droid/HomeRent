const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recalcListingRating = async (listingId) => {
  const result = await prisma.review.aggregate({
    where: { listingId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      averageRating: result._avg.rating || 0,
      reviewsCount: result._count.rating || 0,
    },
  });
};

module.exports = { recalcListingRating };
