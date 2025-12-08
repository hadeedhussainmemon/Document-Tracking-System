/* Backfill performedByName in document history
   Usage: NODE_ENV=development node backend/scripts/backfillPerformedByName.js
   Make sure your .env has MONGODB_URI set or set MONGODB_URI in environment when running.
*/

const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('../models/Document');
const User = require('../models/User');
const Counter = require('../models/Counter');
const crypto = require('crypto');
const generateRandomString = (len = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(len);
  let res = '';
  for (let i = 0; i < len; i++) res += chars[bytes[i] % chars.length];
  return res;
};
const generateId = (prefix, len = 10) => `${prefix}-${generateRandomString(len)}`;

async function backfill() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

    try {
    const cursor = Document.find().cursor();
    let updatedCount = 0;
    // Helper to generate sequential docRefShort
    const getNextSequence = async name => {
        const updated = await Counter.findOneAndUpdate(
            { _id: name },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return updated.seq;
    };

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      let changed = false;
      // If docRef missing, add one
      if (!doc.docRef) {
        doc.docRef = generateId('DOC', 10);
        changed = true;
      }
      // If docRefShort missing, add sequential one
      if (!doc.docRefShort) {
        try {
            const seq = await getNextSequence('documentRef');
            doc.docRefShort = `DOC-${String(seq).padStart(6, '0')}`;
            changed = true;
        } catch (e) {
            // ignore
        }
      }
      if (Array.isArray(doc.history) && doc.history.length > 0) {
        for (let i = 0; i < doc.history.length; i++) {
          const h = doc.history[i];
          // fill performedByName if missing and performedBy exists
          if ((!h.performedByName || h.performedByName === '') && h.performedBy) {
            try {
              const user = await User.findById(h.performedBy).select('username');
              if (user && user.username) {
                h.performedByName = user.username;
                changed = true;
              }
            } catch (e) {
              // ignore single lookups, nothing to do where user not found
            }
          }
          // add eventId if missing
          if (!h.eventId) {
            h.eventId = generateId('EVT', 10);
            changed = true;
          }
        }
      }
      if (changed) {
        await doc.save();
        updatedCount++;
        console.log(`Updated document ${doc._id}`);
      }
    }
    console.log(`Backfill complete. Updated ${updatedCount} documents`);
  } catch (err) {
    console.error('Backfill failed:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

backfill();
