const app = require('../app');
const serverless = require('serverless-http');

// Export the express app wrapped for serverless runtime
module.exports = serverless(app);
