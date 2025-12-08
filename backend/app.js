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
// Enable CORS for development client; use an environment variable to lock down in production
// Explicitly allow x-auth-token header used by the client and common HTTP methods.
app.use(cors({ 
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','x-auth-token','Authorization']
}));

app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);
app.use('/users', usersRoutes);
app.use('/auditlogs', auditLogRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Document Tracking System API');
});

// Health endpoint for uptime / runtime checks (does not require DB to return a 200)
app.get('/health', (req, res) => {
    return res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic env checks
if (!process.env.JWT_SECRET) {
    console.warn('Warning: JWT_SECRET is not set. Login/register will fail until it is configured. Set JWT_SECRET in the backend .env.');
}

// Environment toggles
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_WORKER_RUNTIME);
const skipDB = ((process.env.SKIP_DB || '').toLowerCase() === 'true') || (process.env.SKIP_DB === '1');

if (skipDB) console.log('SKIP_DB=true: Skipping MongoDB connect and admin creation (useful for local dev without DB)');
if (isServerless) console.log('Serverless runtime detected: skipping app.listen and admin creation');

if (!skipDB && !process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not set and SKIP_DB is false. Server will attempt to connect and likely fail.');
}


// Initialize DB connection asynchronously (non-blocking for serverless)
if (!skipDB) {
    const connectDB = async () => {
        if (mongoose.connection.readyState === 0) {
            try {
                await mongoose.connect(process.env.MONGODB_URI, {
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                });
                console.log('MongoDB connected');
                
                // Create admin user after connection
                if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
                    await ensureAdminUser();
                }
            } catch (err) {
                console.error('MongoDB connection failed:', err.message);
            }
        }
    };
    
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

    // Start DB connection in background (non-blocking)
    connectDB();
} else {
    console.log('SKIP_DB=true: Not attempting MongoDB connection.');
}

// Start local server only if not serverless and not in test mode
if (!isServerless && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something broke!', message: err.message });
});

// Export app immediately - don't wait for DB
module.exports = app;

// Global error handlers to log unhandled exceptions and rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // recommended to exit process after logging
    if (!isServerless) {
        process.exit(1);
    }
});
