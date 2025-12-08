const app = require('../backend/app');
const serverless = require('serverless-http');

// Wrap the express app using serverless-http for better compatibility with Vercel's function runtime
module.exports = serverless(app);
const app = require('../backend/app');

// Export the express app; Vercel will call the exported function as a serverless handler.
module.exports = app;
