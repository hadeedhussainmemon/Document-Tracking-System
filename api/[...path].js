const app = require('../backend/app');
const serverless = require('serverless-http');

// Wrap the express app using serverless-http for better compatibility with Vercel's function runtime
module.exports = serverless(app);
