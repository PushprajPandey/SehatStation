require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Hospital = require('../models/hospital');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  try {
    // Remove any existing sample hospitals with same test email
    await Hospital.deleteMany({ email: /sample_hospital/ });

    // Hash the password before saving
    const { hashPassword } = require('../utils/bcrypt/bcryptUtils');
    const hashed = await hashPassword('password123');

    const sample = new Hospital({
      name: 'Sample City Hospital',
      address: { street: '123 Sample St', city: 'Sample City', state: 'Sample State', postalCode: '123456' },
      phone: '+911234567890',
      email: 'sample_hospital@example.com',
      website: 'https://example-hospital.local',
      departments: ['Cardiology', 'Orthopedics', 'General Medicine'],
      availableServices: ['OPD', 'Emergency', 'Lab Tests'],
      ratings: 4.2,
      password: hashed, // hashed password for dev/test
      lat: 12.9716,
      long: 77.5946,
      doctors: [
        {
          _id: 'doc-sample-1',
          name: 'Dr. A. Sample',
          phone: '+911234000001',
          department: 'Cardiology',
          opdSchedule: { monday: '10:00-12:00', tuesday: null, wednesday: '14:00-16:00', thursday: null, friday: '10:00-12:00', saturday: null, sunday: null },
        },
        {
          _id: 'doc-sample-2',
          name: 'Dr. B. Example',
          phone: '+911234000002',
          department: 'Orthopedics',
          opdSchedule: { monday: null, tuesday: '11:00-13:00', wednesday: null, thursday: '15:00-17:00', friday: null, saturday: null, sunday: null },
        },
      ],
    });

    await sample.save();
    console.log('Sample hospital seeded:', sample._id);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected after seeding');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
