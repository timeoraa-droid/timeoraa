const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const runTests = async () => {
  const passed = [];
  const failed = [];

  const test = (name, fn) => {
    try { fn(); passed.push(name); }
    catch (e) { failed.push(`${name}: ${e.message.split('\n')[0]}`); }
  };

  test('User model loads', () => { const m = require('../models/User'); if (!m.modelName) throw new Error('No modelName'); });
  test('Product model loads', () => { const m = require('../models/Product'); if (!m.modelName) throw new Error('No modelName'); });
  test('Order model loads', () => { const m = require('../models/Order'); if (!m.modelName) throw new Error('No modelName'); });
  test('CallLog model loads', () => { const m = require('../models/CallLog'); if (!m.modelName) throw new Error('No modelName'); });
  test('Category model loads', () => { const m = require('../models/Category'); if (!m.modelName) throw new Error('No modelName'); });
  test('Coupon model loads', () => { const m = require('../models/Coupon'); if (!m.modelName) throw new Error('No modelName'); });
  test('Review model loads', () => { const m = require('../models/Review'); if (!m.modelName) throw new Error('No modelName'); });
  test('Payment model loads', () => { const m = require('../models/Payment'); if (!m.modelName) throw new Error('No modelName'); });
  test('Auth routes load', () => { const r = require('../routes/authRoutes'); if (!r.stack) throw new Error('No stack'); });
  test('Order routes load', () => { const r = require('../routes/orderRoutes'); if (!r.stack) throw new Error('No stack'); });
  test('Product routes load', () => { const r = require('../routes/productRoutes'); if (!r.stack) throw new Error('No stack'); });
  test('Payment routes load', () => { const r = require('../routes/paymentRoutes'); if (!r.stack) throw new Error('No stack'); });
  test('Voice routes load', () => { const r = require('../routes/voiceRoutes').router; if (!r.stack) throw new Error('No stack'); });
  test('Coupon routes load', () => { const r = require('../routes/couponRoutes'); if (!r.stack) throw new Error('No stack'); });
  test('Middleware imports work', () => {
    const { protect, admin } = require('../middleware/authMiddleware');
    if (typeof protect !== 'function') throw new Error('protect not a function');
    if (typeof admin !== 'function') throw new Error('admin not a function');
  });
  test('Logger works', () => {
    const { logError, logWarn, logInfo } = require('../utils/logger');
    if (typeof logError !== 'function') throw new Error('logError not a function');
  });
  test('dotenv config has required vars', () => {
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) throw new Error('No MongoDB URI configured');
  });

  console.log('\n===================================');
  console.log('  Tests: ' + (passed.length + failed.length));
  console.log('  Passed: ' + passed.length);
  console.log('  Failed: ' + failed.length);
  if (failed.length) {
    console.log('\nFailures:');
    failed.forEach(f => console.log('  - ' + f));
  } else {
    console.log('\nAll tests passed!');
  }
  console.log('===================================\n');
  process.exit(failed.length > 0 ? 1 : 0);
};

runTests().catch(e => { console.error(e); process.exit(1); });
