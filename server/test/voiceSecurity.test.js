const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateTwilioRequest, router } = require('../routes/voiceRoutes');
const { isAffirmative } = require('../services/voiceBridge');
const { isPhoneConfigured, matchesBusinessNumber, validateWebsocketRequest } = require('../providers/twilioVoice');

test('Twilio webhook validation accepts a valid provider signature only', () => {
  const previous = {
    token: process.env.TWILIO_AUTH_TOKEN,
    baseUrl: process.env.TWILIO_PUBLIC_BASE_URL,
  };
  process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';
  process.env.TWILIO_PUBLIC_BASE_URL = 'https://voice.example.test';
  const body = { CallSid: 'CA12345678901234567890', CallStatus: 'completed' };
  const url = 'https://voice.example.test/api/voice/status';
  const signature = twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN, url, body);
  const req = {
    originalUrl: '/api/voice/status',
    body,
    get: (name) => name.toLowerCase() === 'x-twilio-signature' ? signature : undefined,
  };

  try {
    assert.equal(validateTwilioRequest(req), true);
    req.get = () => 'invalid-signature';
    assert.equal(validateTwilioRequest(req), false);
  } finally {
    if (previous.token === undefined) delete process.env.TWILIO_AUTH_TOKEN;
    else process.env.TWILIO_AUTH_TOKEN = previous.token;
    if (previous.baseUrl === undefined) delete process.env.TWILIO_PUBLIC_BASE_URL;
    else process.env.TWILIO_PUBLIC_BASE_URL = previous.baseUrl;
  }
});

test('Twilio media WebSocket upgrade requires a valid provider signature', () => {
  const previousToken = process.env.TWILIO_AUTH_TOKEN;
  const previousStreamBase = process.env.VOICE_STREAM_BASE_URL;
  process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';
  process.env.VOICE_STREAM_BASE_URL = 'wss://voice.example.test';
  const requestPath = '/api/voice/stream?callSid=CA12345678901234567890';
  const signature = twilio.getExpectedTwilioSignature(
    process.env.TWILIO_AUTH_TOKEN,
    `https://voice.example.test${requestPath}`,
    {},
  );
  const request = { url: requestPath, headers: { 'x-twilio-signature': signature } };

  try {
    assert.equal(validateWebsocketRequest(request), true);
    request.headers['x-twilio-signature'] = 'invalid-signature';
    assert.equal(validateWebsocketRequest(request), false);
  } finally {
    if (previousToken === undefined) delete process.env.TWILIO_AUTH_TOKEN;
    else process.env.TWILIO_AUTH_TOKEN = previousToken;
    if (previousStreamBase === undefined) delete process.env.VOICE_STREAM_BASE_URL;
    else process.env.VOICE_STREAM_BASE_URL = previousStreamBase;
  }
});

test('voice admin endpoints reject requests without authentication', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/voice', router);
  const server = app.listen(0);
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/voice/admin/calls`);
    assert.equal(response.status, 401);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('voice admin endpoints reject an authenticated regular customer', async () => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ _id: '507f1f77bcf86cd799439011', role: 'user' }) });
  const app = express();
  app.use(express.json());
  app.use('/api/voice', router);
  const server = app.listen(0);
  try {
    const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET || 'timeora_super_secret_jwt_horology_key_2024');
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/voice/admin/calls`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 403);
  } finally {
    User.findById = originalFindById;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('spoken confirmation accepts explicit English, Hindi, and Gujarati affirmations only', () => {
  assert.equal(isAffirmative('Yes.'), true);
  assert.equal(isAffirmative('हाँ'), true);
  assert.equal(isAffirmative('હા'), true);
  assert.equal(isAffirmative('yes, but not yet'), false);
  assert.equal(isAffirmative('no'), false);
});

test('only the exact TIMEORA India support number qualifies', () => {
  assert.equal(matchesBusinessNumber('+91 8469965711'), true);
  assert.equal(matchesBusinessNumber('+1 (415) 555-2671'), false);
});

test('phone AI stays unavailable without a provider resource SID', async () => {
  const keys = [
    'TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY_SID', 'TWILIO_API_KEY_SECRET', 'TWILIO_VOICE_APP_SID',
    'TWILIO_AUTH_TOKEN', 'TWILIO_PUBLIC_BASE_URL', 'VOICE_STREAM_BASE_URL', 'TWILIO_PHONE_NUMBER',
    'TWILIO_PHONE_NUMBER_SID', 'OPENAI_API_KEY',
  ];
  const previous = keys.map(key => [key, process.env[key]]);
  for (const key of keys) delete process.env[key];
  try {
    assert.equal(await isPhoneConfigured(), false);
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
