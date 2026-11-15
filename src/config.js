const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'wastewise-enterprise-secret-key-2026-secure-jwt',
  JWT_EXPIRY: '12h',
  DATA_FILE: path.join(__dirname, '..', 'data', 'wastewise_db.json'),
  SIMULATED_CURRENT_DATE: '2026-11-15'
};
