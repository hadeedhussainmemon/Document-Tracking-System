const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
const User = require('../models/User');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
    app = require('../app');
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Admin API', () => {
    let token;
    beforeEach(async () => {
        await User.deleteMany({});
        await Document.deleteMany({});
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('admin123', salt);
        const admin = new User({ username: 'admin', password: hashed, role: 'admin', fullName: 'Admin User' });
        await admin.save();

        // Login to get token
        const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
        token = res.body.token;
    });

    test('POST /api/admin/backfill updates documents', async () => {
        // Seed a document missing docRef and history event ids
        const doc = new Document({ title: 'Test doc', content: 'Some content', owner: (await User.findOne({ username: 'admin' }))._id, history: [{ action: 'Created', performedBy: (await User.findOne({ username: 'admin' }))._id }] });
        await doc.save();

        const res = await request(app).post('/api/admin/backfill').set('x-auth-token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('updatedCount');
        // Verify document fields present
        const updatedDoc = await Document.findById(doc._id);
        expect(updatedDoc.docRef).toBeTruthy();
        expect(updatedDoc.docRefShort).toBeTruthy();
        expect(updatedDoc.history && updatedDoc.history[0] && updatedDoc.history[0].eventId).toBeTruthy();
    });
});
