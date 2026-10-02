const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const { errorHandler } = require('../middleware/errorMiddleware');

const listen = (app) => new Promise((resolve) => {
  const server = app.listen(0, () => resolve(server));
});

const close = (server) => new Promise((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve());
});

const withServer = async (app, callback) => {
  const server = await listen(app);
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await close(server);
  }
};

test('Vercel entry exports an Express request handler', () => {
  const handler = require('../../api/index');
  assert.equal(typeof handler, 'function');
  assert.equal(typeof handler.listen, 'function');
});

test('production MongoDB configuration fails clearly instead of falling back to localhost', async () => {
  const previousMode = process.env.NODE_ENV;
  const previousMongoUri = process.env.MONGODB_URI;
  const previousMongoLegacyUri = process.env.MONGO_URI;
  process.env.NODE_ENV = 'production';
  delete process.env.MONGODB_URI;
  delete process.env.MONGO_URI;
  try {
    const connectDB = require('../config/db');
    await assert.rejects(connectDB(), /MongoDB connection is not configured/);
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousMongoUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousMongoUri;
    if (previousMongoLegacyUri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previousMongoLegacyUri;
  }
});

test('Vercel API reports unavailable MongoDB as 503 without exposing configuration', async () => {
  const previousVercel = process.env.VERCEL;
  const previousMongoUri = process.env.MONGODB_URI;
  const previousMongoLegacyUri = process.env.MONGO_URI;
  process.env.VERCEL = '1';
  delete process.env.MONGODB_URI;
  delete process.env.MONGO_URI;
  try {
    const handler = require('../../api/index');
    await withServer(handler, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/products`);
      const body = await response.json();
      assert.equal(response.status, 503);
      assert.equal(body.success, false);
      assert.match(body.message, /temporarily unavailable/i);
      assert.equal(JSON.stringify(body).includes('mongodb://'), false);
    });
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousMongoUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousMongoUri;
    if (previousMongoLegacyUri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previousMongoLegacyUri;
  }
});

test('registration validates missing and mismatched confirmation without querying MongoDB', async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => { throw new Error('Registration validation queried MongoDB'); };
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const missing = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Taylor Customer', email: 'taylor@example.com', password: 'secure123' }),
      });
      assert.equal(missing.status, 400);

      const mismatch = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Taylor Customer',
          email: 'taylor@example.com',
          password: 'secure123',
          confirmPassword: 'different123',
        }),
      });
      assert.equal(mismatch.status, 400);
      assert.match((await mismatch.json()).message, /do not match/i);
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test('registration accepts the existing form fields and never returns the password', async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const createdUsers = [];
  User.findOne = async () => null;
  User.create = async (user) => {
    createdUsers.push(user);
    return {
      _id: '507f1f77bcf86cd799439011',
      name: user.name,
      email: user.email,
      role: user.role,
      membershipTier: 'TIMEORA Royal Patron',
    };
  };
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ' Taylor Customer ',
          email: 'Taylor@Example.com',
          password: 'secure123',
          confirmPassword: 'secure123',
          role: 'admin',
        }),
      });
      const body = await response.json();
      assert.equal(response.status, 201);
      assert.equal(body.user.name, 'Taylor Customer');
      assert.equal(body.user.email, 'taylor@example.com');
      assert.equal(body.user.role, 'user');
      assert.equal(JSON.stringify(body).includes('secure123'), false);
      assert.equal(createdUsers[0].password, 'secure123');
      assert.equal(createdUsers[0].role, 'user');
    });
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test('duplicate registration returns 409', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({ _id: '507f1f77bcf86cd799439011' });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Taylor Customer',
          email: 'taylor@example.com',
          password: 'secure123',
          confirmPassword: 'secure123',
        }),
      });
      assert.equal(response.status, 409);
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test('login rejects malformed credentials before querying MongoDB', async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => { throw new Error('Login validation queried MongoDB'); };
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: { invalid: true }, password: 123 }),
      });
      assert.equal(response.status, 400);
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test('login authenticates a valid customer and does not return its password hash', async () => {
  const originalFindOne = User.findOne;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousJwtExpire = process.env.JWT_EXPIRE;
  process.env.JWT_SECRET = 'test-login-secret-that-is-at-least-32-characters';
  process.env.JWT_EXPIRE = '30d';
  const user = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Taylor Customer',
    email: 'taylor@example.com',
    role: 'user',
    membershipTier: 'TIMEORA Royal Patron',
    isVerified: true,
    isActive: true,
    password: '$2a$12$private-hash',
    matchPassword: async (password) => password === 'secure123',
    save: async () => {},
  };
  User.findOne = () => ({ select: async (fields) => {
    assert.equal(fields, '+password');
    return user;
  } });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ' Taylor@Example.com ', password: 'secure123' }),
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.user.email, user.email);
      assert.equal(typeof body.token, 'string');
      assert.equal(JSON.stringify(body).includes(user.password), false);
    });
  } finally {
    User.findOne = originalFindOne;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousJwtExpire === undefined) delete process.env.JWT_EXPIRE;
    else process.env.JWT_EXPIRE = previousJwtExpire;
  }
});

test('login reports database outages as 503 without exposing internal errors', async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: async () => {
      const error = new Error('private database connection details');
      error.name = 'MongoServerSelectionError';
      throw error;
    },
  });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'taylor@example.com', password: 'secure123' }),
      });
      const body = await response.json();
      assert.equal(response.status, 503);
      assert.match(body.message, /temporarily unavailable/i);
      assert.equal(JSON.stringify(body).includes('private database'), false);
      assert.equal('stack' in body, false);
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test('registration and login refuse to use a fallback JWT secret', async () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  try {
    await withServer(app, async (baseUrl) => {
      const registration = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Taylor Customer',
          email: 'taylor@example.com',
          password: 'secure123',
          confirmPassword: 'secure123',
        }),
      });
      const login = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'taylor@example.com', password: 'secure123' }),
      });
      assert.equal(registration.status, 503);
      assert.equal(login.status, 503);
      assert.equal((await registration.text()).includes('JWT_SECRET'), false);
      assert.equal((await login.text()).includes('JWT_SECRET'), false);
    });
  } finally {
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
  }
});

test('unavailable product database returns 503 rather than a successful empty catalog', async () => {
  const app = express();
  app.use('/api/products', productRoutes);
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/products`);
    const body = await response.json();
    assert.equal(mongoose.connection.readyState === 1, false);
    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.equal(Array.isArray(body.products), false);
  });
});

test('malformed JSON is reported as HTTP 400', async () => {
  const app = express();
  app.use(express.json());
  app.post('/api/auth/register', (req, res) => res.json({ success: true }));
  app.use(errorHandler);
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":',
    });
    assert.equal(response.status, 400);
  });
});
