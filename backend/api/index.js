const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');

dotenv.config();

const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://document-tracking-system-phi.vercel.app'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Accept'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- Database Connection ---
app.use(async (req, res, next) => {
    if (req.path === '/health') return next();
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(503).json({ error: 'Database connection failed' });
    }
});

// --- Middleware ---
app.use(helmet());
app.use(express.json());

// --- Routes ---
// Import routes directly
app.use('/api/auth', require('../routes/auth'));
app.use('/api/documents', require('../routes/documents'));
app.use('/api/users', require('../routes/users'));
app.use('/api/auditlogs', require('../routes/auditlogs'));
app.use('/api/admin', require('../routes/admin'));

// Handle root (legacy support)
app.use('/auth', require('../routes/auth'));
app.use('/documents', require('../routes/documents'));
app.use('/users', require('../routes/users'));
app.use('/auditlogs', require('../routes/auditlogs'));
app.use('/admin', require('../routes/admin'));

app.get('/', (req, res) => res.send('Document Tracking API v2 (Rebuilt)'));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Local Start
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
