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

const backfillPerformedByName = async (req, res) => {
    try {
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

        const cursor = Document.find().cursor();
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            let changed = false;
            if (!doc.docRef) {
                doc.docRef = generateId('DOC', 10);
                changed = true;
            }
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
                    if ((!h.performedByName || h.performedByName === '') && h.performedBy) {
                        try {
                            const user = await User.findById(h.performedBy).select('username');
                            if (user && user.username) {
                                h.performedByName = user.username;
                                changed = true;
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                    if (!h.eventId) {
                        h.eventId = generateId('EVT', 10);
                        changed = true;
                    }
                }
            }
            if (changed) {
                await doc.save();
                updatedCount++;
            }
        }
        return res.json({ msg: 'Backfill complete', updatedCount });
    } catch (err) {
        console.error('Backfill admin failed:', err);
        return res.status(500).json({ msg: 'Backfill failed', error: err.message || 'Unknown' });
    }
};

module.exports = {
    backfillPerformedByName,
};
