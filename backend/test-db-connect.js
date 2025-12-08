#!/usr/bin/env node
// Simple DB connectivity test script for the backend.
// Usage:
//   node test-db-connect.js                  # uses MONGODB_URI from environment
//   MONGODB_URI='mongodb://localhost:27017/docs-tracker' node test-db-connect.js
//   node test-db-connect.js "mongodb://localhost:27017/docs-tracker"

const mongoose = require('mongoose');

async function checkConnection(uri) {
  try {
    console.log('Connecting to MongoDB URI:', uri);
    // Connect with a small timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      // Use unified topology
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connection successful');
    await mongoose.connection.close();
    return 0;
  } catch (err) {
    console.error('MongoDB connection failed:', err && (err.message || err));
    if (err && err.code === 'ENOTFOUND') console.error('DNS lookup failed. Check hostname.');
    if (err && err.name === 'MongoNetworkError') console.error('Network error: check IP whitelist, network connectivity, and MONGODB_URI host.');
    if (err && err.name === 'MongoParseError') console.error('Parse error: check connection string format and credentials encoding.');
    return 1;
  }
}

async function main() {
  const suppliedArg = process.argv[2];
  const envUri = process.env.MONGODB_URI;
  const uri = suppliedArg || envUri;
  if (!uri) {
    console.error('No MONGODB URI supplied. Pass it as an argument or set MONGODB_URI env var.');
    process.exit(2);
  }
  const code = await checkConnection(uri);
  process.exit(code);
}

main();
