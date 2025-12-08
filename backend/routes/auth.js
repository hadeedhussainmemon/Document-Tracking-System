const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, getUser, createUser, requestPasswordReset, resetPassword } = require('../controllers/auth');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    '/register',
    auth,
    [
        check('username', 'Please add a username').not().isEmpty(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    register
);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post(
    '/login',
    // Limit login attempts from an IP to 10 per 10 minutes, but skip this when running tests
    (process.env.NODE_ENV === 'test') ? (req, res, next) => next() : rateLimit({ windowMs: 10 * 60 * 1000, max: 10, message: 'Too many login attempts from this IP, please try again later' }),
    [
        check('username', 'Please include a valid username').not().isEmpty(),
        check('password', 'Password is required').exists()
    ],
    login
);

// Request reset token
router.post('/password-reset', [check('username', 'Please include a valid username').not().isEmpty()], requestPasswordReset);

// Reset password
router.post('/password-reset/:token', [check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })], resetPassword);

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, getUser);

// @route   POST api/auth/create
// @desc    Create a user (admin roles only) with role-based restrictions
// @access  Private
router.post(
    '/create',
    auth,
    [
        check('username', 'Please add a username').not().isEmpty(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role is required').not().isEmpty()
    ],
    createUser
);

module.exports = router;
