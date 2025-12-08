// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'employee', 'manager', 'ceo', 'hr', 'admin', 'technical-admin'],
        default: 'user'
    },
    fullName: { type: String }
    ,
    // security fields
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
