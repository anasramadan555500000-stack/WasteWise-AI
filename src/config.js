const path = require('path');
const os = require('os');

// Detect serverless hosting environments (Vercel, AWS Lambda, Netlify Functions)
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

// On serverless, filesystem is read-only except /tmp
const defaultDataFile = path.join(__dirname, '..', 'data', 'wastewise_db.json');
const writableDataFile = isServerless ? path.join(os.tmpdir(), 'wastewise_db.json') : defaultDataFile;

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'wastewise-enterprise-secret-key-2026-secure-jwt',
  JWT_EXPIRY: '12h',
  DATA_FILE: writableDataFile,
  STATIC_DATA_FILE: defaultDataFile,
  IS_SERVERLESS: isServerless,
  SIMULATED_CURRENT_DATE: '2026-11-15'
};
