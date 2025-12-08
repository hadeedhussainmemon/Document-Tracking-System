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

describe('Documents API', () => {
    let token;
    beforeEach(async () => {
        await User.deleteMany({});
        await Document.deleteMany({});
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('admin123', salt);
        const admin = new User({ username: 'admin', password: hashed, role: 'admin', fullName: 'Admin User' });
        await admin.save();
        const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
        token = res.body.token;
    });

    test('GET /api/documents returns paginated response', async () => {
        // seed 25 documents
        const adminId = (await User.findOne({ username: 'admin' }))._id;
        for (let i = 0; i < 25; i++) {
            const d = new Document({ title: `Doc ${i}`, content: 'x', owner: adminId });
            await d.save();
        }
        const res = await request(app).get('/api/documents?page=2&limit=10').set('x-auth-token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('documents');
        expect(res.body.page).toBe(2);
        expect(res.body.total).toBe(25);
        expect(res.body.totalPages).toBe(3);
        expect(res.body.documents.length).toBe(10);
    });
});
