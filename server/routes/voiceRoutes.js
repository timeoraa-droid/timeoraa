const express = require('express');
const rateLimit = require('express-rate-limit');
const CallLog = require('../models/CallLog');
const Order = require('../models/Order');
const { Setting } = require('../models/Setting');
const { protect, admin } = require('../middleware/authMiddleware');
const twilioVoice = require('../providers/twilioVoice');

const router = express.Router();
const supportedLanguages = ['en', 'hi', 'gu'];
const defaultConfig = {
  greeting: 'Welcome to TIMEORA. I am your AI assistant. How may I help you today?',
  supportedLanguages,
};

const tokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Please wait before starting another call.' },
});

const isVoiceConfigured = twilioVoice.isConfigured;

const getConfig = async () => {
  const record = await Setting.findOne({ key: 'voiceAssistantConfig' }).lean();
  const value = record?.value || {};
  return {
    greeting: typeof value.greeting === 'string' ? value.greeting : defaultConfig.greeting,
    supportedLanguages: Array.isArray(value.supportedLanguages)
      ? value.supportedLanguages.filter((language) => supportedLanguages.includes(language))
      : supportedLanguages,
  };
};

router.get('/config', async (req, res) => {
  try {
    res.json({ success: true, configured: isVoiceConfigured(), phoneConfigured: await twilioVoice.isPhoneConfigured(), ...await getConfig() });
  } catch {
    res.status(500).json({ success: false, message: 'Voice settings unavailable' });
  }
});

router.post('/token', tokenLimiter, async (req, res) => {
  if (!isVoiceConfigured()) {
    return res.status(503).json({ success: false, configured: false, message: 'Website calling is not configured. Please contact TIMEORA support.' });
  }
  try {
    res.json({ success: true, token: twilioVoice.createBrowserToken() });
  } catch {
    res.status(503).json({ success: false, configured: false, message: 'Website calling is temporarily unavailable.' });
  }
});

router.post('/twiml', async (req, res) => {
  if (!twilioVoice.validateRequest(req)) return res.status(403).send('Invalid provider signature');
  if (!process.env.OPENAI_API_KEY || !process.env.TWILIO_PUBLIC_BASE_URL) {
    return res.status(503).send('AI phone support is not configured');
  }

  const callSid = String(req.body.CallSid || '');
  if (!/^CA[A-Za-z0-9]{10,40}$/.test(callSid)) return res.status(400).send('Invalid call reference');
  const source = req.body.Source === 'website' || String(req.body.From || '').startsWith('client:') ? 'website' : 'phone';
  if (source === 'phone' && !await twilioVoice.isConfiguredBusinessNumber(req.body.To)) {
    return res.status(503).send('TIMEORA phone support is not configured for this number');
  }
  await CallLog.findOneAndUpdate({ providerCallId: callSid }, {
    $set: { provider: 'twilio', source, status: 'in-progress', startedAt: new Date() },
    $setOnInsert: { outcome: 'unresolved' },
  }, { upsert: true });

  const publicBase = process.env.TWILIO_PUBLIC_BASE_URL.replace(/\/$/, '');
  const voiceResponse = twilioVoice.createVoiceResponse();
  const connect = voiceResponse.connect();
  const stream = connect.stream({ url: twilioVoice.createMediaStreamUrl(callSid) });
  stream.parameter({ name: 'source', value: source });
  voiceResponse.redirect({ method: 'POST' }, `${publicBase}/api/voice/unavailable`);
  res.type('text/xml').send(voiceResponse.toString());
});

router.post('/unavailable', (req, res) => {
  if (!twilioVoice.validateRequest(req)) return res.status(403).send('Invalid provider signature');
  const voiceResponse = twilioVoice.createVoiceResponse();
  voiceResponse.say('TIMEORA AI support is temporarily unavailable. Please call again later.');
  voiceResponse.hangup();
  res.type('text/xml').send(voiceResponse.toString());
});

router.post('/status', async (req, res) => {
  if (!twilioVoice.validateRequest(req)) return res.status(403).json({ success: false, message: 'Invalid provider signature' });
  const callSid = String(req.body.CallSid || '');
  const status = String(req.body.CallStatus || 'initiated').toLowerCase();
  const allowedStatus = ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'];
  if (!/^CA[A-Za-z0-9]{10,40}$/.test(callSid) || !allowedStatus.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid call status payload' });
  }

  const update = { status };
  if (Number.isFinite(Number(req.body.CallDuration))) update.durationSeconds = Math.max(0, Number(req.body.CallDuration));
  if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(status)) update.endedAt = new Date();
  await CallLog.findOneAndUpdate({ providerCallId: callSid }, {
    $set: update,
    $setOnInsert: { provider: 'twilio', source: 'phone', outcome: 'unresolved' },
  }, { upsert: true });
  res.json({ success: true });
});

router.get('/admin/calls', protect, admin, async (req, res) => {
  try {
    const calls = await CallLog.find().sort({ createdAt: -1 }).limit(100)
      .populate('order', 'orderId total status').lean();
    res.json({ success: true, calls });
  } catch {
    res.status(500).json({ success: false, message: 'Call history unavailable' });
  }
});

router.get('/admin/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({ source: 'voice' }).sort({ createdAt: -1 }).limit(100)
      .select('orderId items total status createdAt shippingInfo.firstName shippingInfo.lastName shippingInfo.email').lean();
    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ success: false, message: 'Voice orders unavailable' });
  }
});

router.get('/admin/config', protect, admin, async (req, res) => {
  try {
    res.json({ success: true, config: await getConfig() });
  } catch {
    res.status(500).json({ success: false, message: 'Voice settings unavailable' });
  }
});

router.put('/admin/config', protect, admin, async (req, res) => {
  const greeting = typeof req.body?.greeting === 'string' ? req.body.greeting.replace(/[\u0000-\u001f\u007f]/g, '').trim() : '';
  const languages = Array.isArray(req.body?.supportedLanguages)
    ? [...new Set(req.body.supportedLanguages.filter((language) => supportedLanguages.includes(language)))]
    : [];
  if (!greeting || greeting.length > 500 || languages.length === 0) {
    return res.status(400).json({ success: false, message: 'Provide a greeting up to 500 characters and at least one supported language.' });
  }
  try {
    await Setting.findOneAndUpdate(
      { key: 'voiceAssistantConfig' },
      { value: { greeting, supportedLanguages: languages } },
      { upsert: true, new: true, runValidators: true },
    );
    res.json({ success: true, config: { greeting, supportedLanguages: languages } });
  } catch {
    res.status(500).json({ success: false, message: 'Voice settings could not be saved' });
  }
});

module.exports = { router, isVoiceConfigured, validateTwilioRequest: twilioVoice.validateRequest };