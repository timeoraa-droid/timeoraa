const twilio = require('twilio');
const crypto = require('crypto');

const TIMEORA_SUPPORT_NUMBER = '+918469965711';
let phoneConfigurationCache = { checkedAt: 0, configured: false };

const isConfigured = () => Boolean(
  process.env.TWILIO_ACCOUNT_SID
  && process.env.TWILIO_API_KEY_SID
  && process.env.TWILIO_API_KEY_SECRET
  && process.env.TWILIO_VOICE_APP_SID
  && process.env.TWILIO_AUTH_TOKEN
  && process.env.TWILIO_PUBLIC_BASE_URL
  && process.env.VOICE_STREAM_BASE_URL
  && process.env.OPENAI_API_KEY,
);

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
const matchesBusinessNumber = (candidate) => normalizePhone(candidate) === normalizePhone(TIMEORA_SUPPORT_NUMBER);

const isPhoneConfigured = async () => {
  const now = Date.now();
  if (now - phoneConfigurationCache.checkedAt < 30_000) return phoneConfigurationCache.configured;
  phoneConfigurationCache = { checkedAt: now, configured: false };
  if (!isConfigured() || !process.env.TWILIO_PHONE_NUMBER_SID
    || !/^\+[1-9]\d{7,14}$/.test(process.env.TWILIO_PHONE_NUMBER || '')
    || !matchesBusinessNumber(process.env.TWILIO_PHONE_NUMBER)) return false;

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const number = await client.incomingPhoneNumbers(process.env.TWILIO_PHONE_NUMBER_SID).fetch();
    const expectedVoiceUrl = `${process.env.TWILIO_PUBLIC_BASE_URL.replace(/\/$/, '')}/api/voice/twiml`;
    const configured = matchesBusinessNumber(number.phoneNumber)
      && number.capabilities?.voice === true
      && number.voiceMethod === 'POST'
      && new URL(number.voiceUrl).toString() === new URL(expectedVoiceUrl).toString();
    phoneConfigurationCache = { checkedAt: now, configured };
    return configured;
  } catch {
    phoneConfigurationCache = { checkedAt: now, configured: false };
    return false;
  }
};

const isConfiguredBusinessNumber = async (candidate) => (await isPhoneConfigured()) && matchesBusinessNumber(candidate);

const validateRequest = (req) => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const baseUrl = process.env.TWILIO_PUBLIC_BASE_URL;
  const signature = req.get('x-twilio-signature');
  if (!authToken || !baseUrl || !signature) return false;
  const requestUrl = new URL(req.originalUrl, baseUrl);
  requestUrl.host = new URL(baseUrl).host;
  requestUrl.protocol = new URL(baseUrl).protocol;
  return twilio.validateRequest(authToken, signature, requestUrl.toString(), req.body);
};

const validateWebsocketRequest = (request) => {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const streamBase = process.env.VOICE_STREAM_BASE_URL;
  const signature = request.headers['x-twilio-signature'];
  if (!authToken || !streamBase || !signature) return false;
  const requestUrl = new URL(request.url, streamBase);
  const base = new URL(streamBase);
  requestUrl.host = base.host;
  requestUrl.protocol = base.protocol === 'wss:' ? 'https:' : base.protocol;
  return twilio.validateRequest(authToken, signature, requestUrl.toString(), {});
};

const createBrowserToken = () => {
  const accessToken = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    { identity: `timeora-${crypto.randomUUID()}`, ttl: 600 },
  );
  accessToken.addGrant(new twilio.jwt.AccessToken.VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_VOICE_APP_SID,
  }));
  return accessToken.toJwt();
};

const createVoiceResponse = () => new twilio.twiml.VoiceResponse();

const createMediaStreamUrl = (callSid) => {
  const base = process.env.VOICE_STREAM_BASE_URL.replace(/\/$/, '');
  const websocketBase = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
  return `${websocketBase}/api/voice/stream?callSid=${encodeURIComponent(callSid)}`;
};

module.exports = {
  isConfigured,
  isPhoneConfigured,
  isConfiguredBusinessNumber,
  matchesBusinessNumber,
  validateRequest,
  validateWebsocketRequest,
  createBrowserToken,
  createVoiceResponse,
  createMediaStreamUrl,
};