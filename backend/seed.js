const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homerent.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@homerent.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@homerent.com' },
    update: {},
    create: {
      name: 'Алихан Нурланов',
      email: 'user1@homerent.com',
      password: userPassword,
    },
  });
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@homerent.com' },
    update: {},
    create: {
      name: 'Мария Иванова',
      email: 'user2@homerent.com',
      password: userPassword,
    },
  });

  // Create sample listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'Luxury Apartment in Astana City Center',
        description: 'A beautiful modern apartment with stunning views of the Bayterek Tower. Fully furnished with premium amenities, perfect for business travelers and tourists. Features include a king-size bed, fully equipped kitchen, and a balcony with panoramic city views.',
        propertyType: 'APARTMENT',
        price: 120,
        location: 'Astana, Kazakhstan',
        lat: 51.1694,
        lng: 71.4491,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        amenities: ['wifi', 'parking', 'kitchen', 'air-conditioning', 'tv', 'washer'],
        approved: true,
        ownerId: admin.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Cozy Studio near Mega Almaty',
        description: 'Warm and cozy studio apartment located just 5 minutes from Mega Almaty shopping center. Great public transport connections. Ideal for couples or solo travelers exploring the city.',
        propertyType: 'APARTMENT',
        price: 65,
        location: 'Almaty, Kazakhstan',
        lat: 43.2220,
        lng: 76.8512,
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        ],
        amenities: ['wifi', 'kitchen', 'tv', 'heating'],
        approved: true,
        ownerId: admin.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Mountain View Chalet in Shymbulak',
        description: 'Escape to the mountains in this charming chalet near the Shymbulak ski resort. Perfect for winter sports enthusiasts and nature lovers. Enjoy breathtaking mountain views and fresh air.',
        propertyType: 'HOUSE',
        price: 200,
        location: 'Shymbulak, Almaty Region',
        lat: 43.1585,
        lng: 77.0798,
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
          'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
        ],
        amenities: ['wifi', 'parking', 'kitchen', 'fireplace', 'heating', 'mountain-view'],
        approved: true,
        ownerId: user1.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Business Suite in Nur-Sultan Towers',
        description: 'Premium business suite in the heart of the new capital. Walking distance to government buildings and business centers. Equipped with a dedicated workspace and high-speed internet.',
        propertyType: 'APARTMENT',
        price: 150,
        location: 'Astana, Kazakhstan',
        lat: 51.1282,
        lng: 71.4307,
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ],
        amenities: ['wifi', 'parking', 'kitchen', 'air-conditioning', 'tv', 'workspace', 'gym'],
        approved: true,
        ownerId: user1.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Seaside Villa in Aktau',
        description: 'Beautiful villa on the Caspian Sea coast. Private beach access, pool, and garden. Perfect for family vacations. Spacious rooms with sea views.',
        propertyType: 'HOUSE',
        price: 300,
        location: 'Aktau, Kazakhstan',
        lat: 43.6352,
        lng: 51.1694,
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        ],
        amenities: ['wifi', 'parking', 'kitchen', 'pool', 'air-conditioning', 'tv', 'sea-view', 'garden'],
        approved: true,
        ownerId: user2.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Traditional Yurt Experience',
        description: 'Experience authentic Kazakh nomadic life in a modern yurt equipped with all comforts. Located in the beautiful steppe near Burabay National Park.',
        propertyType: 'HOUSE',
        price: 80,
        location: 'Burabay, Kazakhstan',
        lat: 52.9955,
        lng: 70.3142,
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        ],
        amenities: ['wifi', 'parking', 'heating', 'nature-view', 'breakfast'],
        approved: true,
        ownerId: user2.id,
      },
    }),
  ]);

  // Create sample bookings
  const now = new Date();
  const future1 = new Date(now);
  future1.setDate(future1.getDate() + 10);
  const future2 = new Date(now);
  future2.setDate(future2.getDate() + 15);

  const past1 = new Date(now);
  past1.setDate(past1.getDate() - 20);
  const past2 = new Date(now);
  past2.setDate(past2.getDate() - 15);

  await prisma.booking.createMany({
    data: [
      {
        userId: user1.id,
        listingId: listings[0].id,
        startDate: future1,
        endDate: future2,
        totalPrice: 5 * 120,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      {
        userId: user2.id,
        listingId: listings[2].id,
        startDate: past1,
        endDate: past2,
        totalPrice: 5 * 200,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      {
        userId: user1.id,
        listingId: listings[4].id,
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        totalPrice: 5 * 300,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    ],
  });

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      { userId: user1.id, listingId: listings[0].id, rating: 5, comment: 'Amazing apartment! The view is breathtaking and everything was spotlessly clean.' },
      { userId: user2.id, listingId: listings[0].id, rating: 4, comment: 'Great location and comfortable stay. Would definitely come back.' },
      { userId: user1.id, listingId: listings[2].id, rating: 5, comment: 'Perfect mountain getaway. The chalet is beautiful and well-equipped.' },
      { userId: user2.id, listingId: listings[1].id, rating: 4, comment: 'Cozy place, great value for money. Close to public transport.' },
      { userId: user1.id, listingId: listings[4].id, rating: 5, comment: 'The villa is stunning! Private beach was incredible.' },
    ],
  });

  // Recalculate ratings
  const { recalcListingRating } = require('./src/utils/rating');
  for (const listing of listings) {
    await recalcListingRating(listing.id);
  }

  // Create some audit logs
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SEED', entity: 'System', details: 'Database seeded' },
      { userId: admin.id, action: 'CREATE_LISTING', entity: 'Listing', entityId: listings[0].id },
      { userId: user1.id, action: 'CREATE_BOOKING', entity: 'Booking', entityId: 1 },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Admin login: admin@homerent.com / admin123');
  console.log('User login: user1@homerent.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
