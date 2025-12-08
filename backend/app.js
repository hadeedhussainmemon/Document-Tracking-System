const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Ensure a JWT secret exists for tests/development to avoid auth signing errors
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'test') {
        process.env.JWT_SECRET = 'test_jwt_secret';
        console.log('JWT_SECRET not set; using test_jwt_secret for tests');
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const usersRoutes = require('./routes/users');
const auditLogRoutes = require('./routes/auditlogs');
const adminRoutes = require('./routes/admin');

app.use(express.json());
// Enable CORS for development client; use an environment variable to lock down in production
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auditlogs', auditLogRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Document Tracking System API');
});

// Basic env checks
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. Login/register will fail until it is configured. Set JWT_SECRET in the backend .env.');
}

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        // Ensure admin user exists if environment variables are present
        const ensureAdminUser = async () => {
            try {
                const User = require('./models/User');
                const bcrypt = require('bcryptjs');

                const adminUsername = process.env.ADMIN_USERNAME;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (!adminUsername || !adminPassword) {
                    console.log('No ADMIN_USERNAME/ADMIN_PASSWORD set; skipping admin creation');
                    return;
                }

                let admin = await User.findOne({ username: adminUsername });
                if (!admin) {
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(adminPassword, salt);
                    admin = new User({ username: adminUsername, password: hashed, role: 'admin' });
                    await admin.save();
                    console.log(`Admin user created: ${adminUsername}`);
                } else {
                    if (admin.role !== 'admin') {
                        admin.role = 'admin';
                        await admin.save();
                        console.log(`Updated existing user ${adminUsername} to admin`);
                    } else {
                        console.log(`Admin user already exists: ${adminUsername}`);
                    }
                }
            } catch (err) {
                if (err && err.code === 11000) {
                    // duplicate key error - user already exists (race condition), ignore
                    console.log('Admin user already created concurrently');
                } else {
                    console.error('Failed to ensure admin user:', err);
                }
            }
        };

        if (process.env.NODE_ENV !== 'test') {
            ensureAdminUser();
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = app;

// Global error handlers to log unhandled exceptions and rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // recommended to exit process after logging
    process.exit(1);
});
