const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let app;
const User = require('../models/User');
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

describe('Users API', () => {
    let token;

    beforeEach(async () => {
        await User.deleteMany({});
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('admin123', salt);
        const admin = new User({ username: 'admin', password: hashed, role: 'admin', fullName: 'Admin User' });
        await admin.save();

        // Login to get token
        const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
        if (!res || !res.body || !res.body.token) {
            console.error('Login failed during beforeEach. Status:', res?.status, 'Body:', res?.body, 'Text:', res?.text);
        }
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeTruthy();
        // console.log('Token in beforeEach (users):', res.body.token);
        token = res.body.token;
    });

    test('GET /api/users returns paginated results for admin', async () => {
        // seed with some users
        for (let i = 0; i < 25; i++) {
            const u = new User({ username: `user${i}`, password: 'x', role: 'user' });
            await u.save();
        }

        const res = await request(app).get('/api/users').set('x-auth-token', token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('users');
        expect(res.body).toHaveProperty('total');
        expect(Array.isArray(res.body.users)).toBeTruthy();
    });

    test('POST /api/auth/create creates a new user', async () => {
        const newUser = { username: 'jane', password: 'password', role: 'user', fullName: 'Jane Doe' };
        const res = await request(app).post('/api/auth/create').set('x-auth-token', token).send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('msg');

        // verify in db
        const u = await User.findOne({ username: 'jane' });
        expect(u).not.toBeNull();
        expect(u.role).toBe('user');
    });

    test('PUT /api/users/:id updates user and DELETE removes user', async () => {
        const user = new User({ username: 'bob', password: 'x', role: 'user' });
        await user.save();

        const updateRes = await request(app)
            .put(`/api/users/${user._id}`)
            .set('x-auth-token', token)
            .send({ fullName: 'Bob The Builder' });
        expect(updateRes.statusCode).toBe(200);

        const updated = await User.findById(user._id);
        expect(updated.fullName).toBe('Bob The Builder');

        const delRes = await request(app).delete(`/api/users/${user._id}`).set('x-auth-token', token);
        expect(delRes.statusCode).toBe(200);

        const check = await User.findById(user._id);
        expect(check).toBeNull();
    });

    test('Manager can create employee but not manager/admin', async () => {
        // Create manager by admin
        const manager = { username: 'manager1', password: 'pass1234', role: 'manager' };
        const createManagerRes = await request(app).post('/api/auth/create').set('x-auth-token', token).send(manager);
        expect(createManagerRes.statusCode).toBe(201);

        // login as manager
        const loginRes = await request(app).post('/api/auth/login').send({ username: 'manager1', password: 'pass1234' });
        const managerToken = loginRes.body.token;

        // manager can create employee
        const emp = { username: 'employee1', password: 'pass1234', role: 'employee' };
        const res1 = await request(app).post('/api/auth/create').set('x-auth-token', managerToken).send(emp);
        expect(res1.statusCode).toBe(201);

        // manager cannot create manager or admin
        const res2 = await request(app).post('/api/auth/create').set('x-auth-token', managerToken).send({ username: 'manager2', password: 'pass1234', role: 'manager' });
        expect(res2.statusCode).toBe(403);

        const res3 = await request(app).post('/api/auth/create').set('x-auth-token', managerToken).send({ username: 'admin2', password: 'pass1234', role: 'admin' });
        expect(res3.statusCode).toBe(403);
    });

    test('HR can create employee but not manager', async () => {
        // Create HR by admin
        const hr = { username: 'hr1', password: 'pass1234', role: 'hr' };
        const createHRRes = await request(app).post('/api/auth/create').set('x-auth-token', token).send(hr);
        expect(createHRRes.statusCode).toBe(201);

        // login as HR
        const loginRes = await request(app).post('/api/auth/login').send({ username: 'hr1', password: 'pass1234' });
        const hrToken = loginRes.body.token;

        // hr can create employee
        const emp = { username: 'employee2', password: 'pass1234', role: 'employee' };
        const res1 = await request(app).post('/api/auth/create').set('x-auth-token', hrToken).send(emp);
        expect(res1.statusCode).toBe(201);

        // hr cannot create manager
        const res2 = await request(app).post('/api/auth/create').set('x-auth-token', hrToken).send({ username: 'manager3', password: 'pass1234', role: 'manager' });
        expect(res2.statusCode).toBe(403);
    });

    test('Normal user cannot create user accounts', async () => {
        // Create a normal user via admin
        await request(app).post('/api/auth/create').set('x-auth-token', token).send({ username: 'joe', password: 'userpass', role: 'user' });
        const loginRes = await request(app).post('/api/auth/login').send({ username: 'joe', password: 'userpass' });
        const userToken = loginRes.body.token;

        const res = await request(app).post('/api/auth/create').set('x-auth-token', userToken).send({ username: 'userX', password: 'userpassX', role: 'user' });
        expect(res.statusCode).toBe(403);
    });

    test('Manager cannot change role of a user', async () => {
        // Create manager and employee
        const manager = { username: 'mgr2', password: 'pass1234', role: 'manager' };
        await request(app).post('/api/auth/create').set('x-auth-token', token).send(manager);
        const loginRes = await request(app).post('/api/auth/login').send({ username: 'mgr2', password: 'pass1234' });
        const managerToken = loginRes.body.token;

        const employee = { username: 'emp2', password: 'pass1234', role: 'employee' };
        const createRes = await request(app).post('/api/auth/create').set('x-auth-token', token).send(employee);
        expect(createRes.statusCode).toBe(201);

        const emp = await User.findOne({ username: 'emp2' });

        // manager tries to change role to manager
        const res = await request(app).put(`/api/users/${emp._id}`).set('x-auth-token', managerToken).send({ role: 'manager' });
        expect(res.statusCode).toBe(403);
    });

    test('Admin cannot delete self', async () => {
        // Admin tries to delete own account
        const adminUser = await User.findOne({ username: 'admin' });
        const res = await request(app).delete(`/api/users/${adminUser._id}`).set('x-auth-token', token);
        expect(res.statusCode).toBe(400);
    });

    test('Register endpoint is admin-only', async () => {
        // Unauthenticated should receive 401
        const resUnauth = await request(app).post('/api/auth/register').send({ username: 'anon', password: 'x' });
        expect(resUnauth.statusCode).toBe(401);

        // Normal user should receive 403
        const createNormal = await request(app).post('/api/auth/create').set('x-auth-token', token).send({ username: 'normal1', password: 'pass123', role: 'user' });
        expect(createNormal.statusCode).toBe(201);
        const userRes = await request(app).post('/api/auth/login').send({ username: 'normal1', password: 'pass123' });
        const userToken = userRes.body.token;
        const resUser = await request(app).post('/api/auth/register').set('x-auth-token', userToken).send({ username: 't1', password: 'pass123' });
        expect(resUser.statusCode).toBe(403);

        // Admin can register a user
        const resAdmin = await request(app).post('/api/auth/register').set('x-auth-token', token).send({ username: 't2', password: 'pass123' });
        expect(resAdmin.statusCode).toBe(200);
    });
});
