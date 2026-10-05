require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Rental = require('./models/Rental');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing database collections...');
    await Rental.deleteMany({});
    await Equipment.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Seeding Users...');
    // Create Admin User
    const admin = await User.create({
      name: 'Admin Manager',
      email: 'admin@sportsrental.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });

    // Create Sample Member User
    const member = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'MemberPassword123!',
      role: 'member'
    });

    console.log(`[Seed] Created Admin: ${admin.email} (Password: AdminPassword123!)`);
    console.log(`[Seed] Created Member: ${member.email} (Password: MemberPassword123!)`);

    console.log('[Seed] Seeding Sports Equipment Catalog...');
    const equipmentItems = await Equipment.create([
      {
        name: 'Trek Marlin 7 Mountain Bike',
        category: 'Cycling',
        description: 'Lightweight aluminum frame trail bike with hydraulic disc brakes and RockShox suspension fork for rough terrain.',
        available: true
      },
      {
        name: 'Perception Pescador 12.0 Kayak',
        category: 'Water Sports',
        description: 'Sit-on-top recreational kayak with deluxe padded seating and ample cargo storage for lakes and calm rivers.',
        available: true
      },
      {
        name: 'Burton Custom Flying V Snowboard',
        category: 'Winter Sports',
        description: 'All-mountain versatile snowboard with rocker/camber hybrid design for maximum float and edge control.',
        available: false
      },
      {
        name: 'Wilson Pro Staff 97 Tennis Racket',
        category: 'Racquet Sports',
        description: 'Precision-engineered tournament-grade tennis racket delivering pinpoint control and solid feel.',
        available: true
      },
      {
        name: 'The North Face Wawona 6-Person Camping Tent',
        category: 'Camping',
        description: 'Spacious hybrid single/double wall family camping tent with high ceiling and massive vestibule.',
        available: true
      },
      {
        name: 'Red Paddle Co Inflatable SUP Board',
        category: 'Water Sports',
        description: 'Premium inflatable stand-up paddleboard with titan pump, three-piece paddle, and rolling carry backpack.',
        available: true
      },
      {
        name: 'Callaway Mavrik Complete Golf Club Set',
        category: 'Golf',
        description: 'Complete 12-piece club set featuring titanium driver, fairway woods, cavity-back irons, putter, and stand bag.',
        available: true
      },
      {
        name: 'Black Diamond Trail Pro Trekking Poles',
        category: 'Hiking & Trekking',
        description: 'Pair of lightweight aluminum trekking poles with FlickLock Pro adjustments and ergonomic dual-density grips.',
        available: true
      }
    ]);

    console.log(`[Seed] Created ${equipmentItems.length} equipment items.`);

    console.log('[Seed] Seeding Initial Rental Records...');
    // Create an active rental for Burton Snowboard by John Doe
    const activeRental = await Rental.create({
      equipment: equipmentItems[2]._id, // Burton Custom Flying V Snowboard
      member: member._id,
      rentedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // rented 2 days ago
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // due in 5 days
      status: 'active'
    });

    console.log(`[Seed] Created active rental for ${equipmentItems[2].name}`);

    // Create an overdue sample rental for testing overdue features
    // Let's create an overdue item
    const overdueEquipment = await Equipment.create({
      name: 'Salomon QST 92 All-Mountain Skis',
      category: 'Winter Sports',
      description: 'High-performance freeride skis equipped with Warden 11 bindings.',
      available: false
    });

    await Rental.create({
      equipment: overdueEquipment._id,
      member: member._id,
      rentedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // expired 3 days ago
      status: 'active'
    });

    console.log(`[Seed] Created overdue rental for ${overdueEquipment.name}`);

    console.log('\n=========================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('=========================================');
    console.log('Admin credentials : admin@sportsrental.com / AdminPassword123!');
    console.log('Member credentials: john@example.com / MemberPassword123!');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
