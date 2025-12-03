const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function run() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const coll = db.collection('hospitals');
    const indexes = await coll.indexes();
    console.log('Existing indexes:', indexes.map(i=>i.name));
    const target = 'doctors._id_1';
    const has = indexes.find(i=>i.name === target);
    if (has) {
      console.log('Dropping index', target);
      await coll.dropIndex(target);
      console.log('Dropped');
    } else {
      console.log('Index not found:', target);
    }
  } catch (err) {
    console.error('Error dropping index:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
