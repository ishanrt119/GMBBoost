// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const business = await prisma.business.create({
    data: {
      name: 'Glamour Salon & Spa',
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      reviewLink: 'https://g.page/r/demo/review',
    },
  });

  const passwordHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: {
      businessId: business.id,
      name: 'Admin User',
      email: 'admin@glamour.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Seed customers
  const customers = await prisma.customer.createMany({
    data: [
      { businessId: business.id, firstName: 'Priya',   lastName: 'Sharma',  phone: '+919820011234', email: 'priya@mail.com',   service: 'Hair Cut',   channel: 'WHATSAPP', source: 'CSV' },
      { businessId: business.id, firstName: 'Rahul',   lastName: 'Mehta',   phone: '+917010055678', email: 'rahul@mail.com',   service: 'Facial',     channel: 'EMAIL',    source: 'CSV' },
      { businessId: business.id, firstName: 'Ananya',  lastName: 'Singh',   phone: '+919900044321', email: 'ananya@mail.com',  service: 'Manicure',   channel: 'WHATSAPP', source: 'MANUAL' },
      { businessId: business.id, firstName: 'Vikram',  lastName: 'Nair',    phone: '+917890012345', email: 'vikram@mail.com',  service: 'Massage',    channel: 'SMS',      source: 'CSV' },
      { businessId: business.id, firstName: 'Deepika', lastName: 'Patel',   phone: '+919100098765', email: 'deepika@mail.com', service: 'Hair Color', channel: 'EMAIL',    source: 'MANUAL' },
    ],
  });

  console.log(`✅ Seeded: 1 business, 1 admin user, 5 customers`);
  console.log(`📧 Login: admin@glamour.com / Admin@1234`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
