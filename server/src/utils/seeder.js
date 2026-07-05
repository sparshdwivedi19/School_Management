const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User.model');
const SchoolSettings = require('../models/SchoolSettings.model');
const logger = require('./logger');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected for Seeding');

    // 1. Seed School Settings
    const settingsCount = await SchoolSettings.countDocuments();
    if (settingsCount === 0) {
      await SchoolSettings.create({
        schoolName: 'Suncity School',
        shortName: 'SCS',
        academicSession: '2025-26',
        board: 'CBSE',
      });
      logger.info('✅ Default School Settings seeded');
    } else {
      logger.info('⚠️ School Settings already exist');
    }

    // 2. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@suncity.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@suncity.com',
        password: 'Password123!', 
        role: 'admin',
        mustChangePassword: false, 
      });
      logger.info('✅ Default Admin User seeded (admin@suncity.com / Password123!)');
    } else {
      logger.info('⚠️ Admin user already exists');
    }

    // 3. Seed Principal User
    const principalExists = await User.findOne({ email: 'principal@suncity.com' });
    if (!principalExists) {
      await User.create({
        name: 'School Principal',
        email: 'principal@suncity.com',
        password: 'Password123!', 
        role: 'principal',
        mustChangePassword: false, 
      });
      logger.info('✅ Default Principal User seeded (principal@suncity.com / Password123!)');
    } else {
      logger.info('⚠️ Principal user already exists');
    }

    // 4. Seed Teacher User
    const teacherExists = await User.findOne({ email: 'teacher@suncity.com' });
    if (!teacherExists) {
      await User.create({
        name: 'A. Teacher',
        email: 'teacher@suncity.com',
        password: 'Password123!', 
        role: 'teacher',
        mustChangePassword: false, 
      });
      logger.info('✅ Default Teacher User seeded (teacher@suncity.com / Password123!)');
    } else {
      logger.info('⚠️ Teacher user already exists');
    }

    logger.info('🌱 Seeding Complete!');
    process.exit();
  } catch (error) {
    logger.error('❌ Error in Seeder: ', error);
    process.exit(1);
  }
};

seedData();
