const WebSocket = require('ws');
const CallLog = require('../models/CallLog');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Setting } = require('../models/Setting');
const { searchProducts, lookupOrder } = require('./voiceTools');
const { createVoiceOrder, getVoiceOrderQuote } = require('./voiceOrder');

const callStates = new Map();
const isAffirmative = (text) => /^(yes|yes please|i agree|i consent|okay|ok|haan|han|ji haan|हाँ|हां|जी हाँ|ठीक है|હા|બરાબર)[\s.!।,]*$/iu.test(String(text || '').trim());

const buildInstructions = () => [
  'You are TIMEORA AI customer support. Identify yourself as an AI assistant at the beginning of each call. Be concise, polite, and natural.',
  'Detect whether the caller is speaking Gujarati, Hindi, or English and continue in that same language.',
  'Use tools for every product price, stock, or order-status fact. Never guess availability, delivery dates, or policy details.',
  'Ask for a human handoff whenever requested or when you cannot resolve the issue.',
  'Never request passwords, OTPs, or full payment card numbers. Never claim an order was placed until the place_order tool confirms it.',
  'Before collecting customer contact or address details for an order or follow-up, call request_data_consent so the system asks for consent. If consent is declined, do not store the details or continue that action.',
  'For order status, obtain the order reference, phone number, and postal code, then use lookup_order.',
  'For orders, first obtain recorded consent via request_data_consent. Then collect details and call review_order. Read the exact backend-priced quote returned, ask for a clear yes, and only then call place_order. Do not claim success before that tool returns it.',
  'Do not claim calls are recorded. Do not retain transcripts.',
].join(' ');

const toolDefinitions = [
  { type: 'function', name: 'search_products', description: 'Search current active TIMEORA products by watch name or category. Use only returned facts.', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { type: 'function', name: 'lookup_order', description: 'Look up an order only after collecting its reference, registered phone, and postal code.', parameters: { type: 'object', properties: { orderId: { type: 'string' }, phone: { type: 'string' }, postalCode: { type: 'string' } }, required: ['orderId', 'phone', 'postalCode'] } },
  { type: 'function', name: 'request_data_consent', description: 'Ask consent before collecting contact/shipping details. The server records consent only after the caller says yes.', parameters: { type: 'object', properties: {}, required: [] } },
  { type: 'function', name: 'review_order', description: 'Prepare a server-priced order quote for spoken review. Requires recorded consent.', parameters: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, postalCode: { type: 'string' }, country: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' } }, required: ['productId', 'quantity'] } } }, required: ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country', 'items'] } },
  { type: 'function', name: 'place_order', description: 'Commit the reviewed COD order only after the server records the caller saying yes to the exact review.', parameters: { type: 'object', properties: {}, required: [] } },
  { type: 'function', name: 'request_handoff', description: 'Queue a human follow-up request; do not claim a live transfer is available.', parameters: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } },
  { type: 'function', name: 'set_call_language', description: 'Record the detected response language without storing any transcript.', parameters: { type: 'object', properties: { language: { type: 'string', enum: ['en', 'hi', 'gu'] } }, required: ['language'] } },
];

const sendJson = (socket, payload) => {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
};

const handleToolCall = async (name, args, callSid) => {
  const state = callStates.get(callSid);
  if (!state) throw new Error('Call session is no longer active');
  if (name === 'search_products') return searchProducts(Product, args.query);
  if (name === 'lookup_order') {
    const order = await lookupOrder(Order, args);
    return order || { verified: false, message: 'Could not verify that order. Ask the caller to check the reference and details.' };
  }
  if (name === 'request_data_consent') {
    state.awaitingConsent = true;
    return { prompt: 'Before we continue, may TIMEORA use your contact and delivery details only to handle this request or order? Say yes to agree, or no to decline.' };
  }
  if (name === 'review_order') {
    if (!state.consented) throw new Error('Customer consent has not been recorded');
    const { customer, quote } = await getVoiceOrderQuote(args);
    state.orderDraft = customer;
    state.quote = quote;
    state.awaitingConfirmation = true;
    state.confirmed = false;
    return { ...quote, instruction: 'Read these exact products, prices, tax, shipping, and total to the customer, then ask for a clear yes before placing the COD order.' };
  }
  if (name === 'place_order') {
    if (!state.consented || !state.confirmed || !state.orderDraft) {
      throw new Error('A spoken customer consent and order confirmation are required');
    }
    const result = await createVoiceOrder({ callSid, input: state.orderDraft, consented: state.consented, confirmed: state.confirmed, acceptedQuote: state.quote });
    await CallLog.findOneAndUpdate({ providerCallId: callSid }, {
      outcome: 'order-created',
      order: result.order._id,
      customer: { name: state.orderDraft.name, email: state.orderDraft.email, phone: state.orderDraft.phone, consented: state.consented },
    });
    state.orderDraft = null;
    state.quote = null;
    state.awaitingConfirmation = false;
    return { orderId: result.order.orderId, total: result.order.total, status: result.order.status, duplicate: result.duplicate };
  }
  if (name === 'request_handoff') {
    const reason = String(args.reason || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 300);
    await CallLog.findOneAndUpdate({ providerCallId: callSid }, {
      outcome: 'handoff-requested', handoffRequestedAt: new Date(), handoffReason: reason,
    });
    return { queued: true, message: 'A human follow-up has been requested. Do not say a live transfer occurred.' };
  }
  if (name === 'set_call_language') {
    const language = ['en', 'hi', 'gu'].includes(args.language) ? args.language : 'en';
    await CallLog.updateOne({ providerCallId: callSid }, { language });
    return { recorded: true };
  }
  throw new Error('Unknown voice tool');
};

const bridgeCall = (twilioSocket) => {
  if (!process.env.OPENAI_API_KEY) return twilioSocket.close(1011, 'AI voice not configured');
  const callSidFromQuery = new URL(twilioSocket.url, 'https://timeora.invalid').searchParams.get('callSid');
  const openAiUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime')}`;
  const openAiSocket = new WebSocket(openAiUrl, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });
  let streamSid;
  let callSid = callSidFromQuery;
  let callStarted = false;
  let sessionReady = false;
  const pendingAudio = [];

  openAiSocket.on('open', async () => {
    const configRecord = await Setting.findOne({ key: 'voiceAssistantConfig' }).lean().catch(() => null);
    const config = configRecord?.value || {};
    sendJson(openAiSocket, {
      type: 'session.update',
      session: {
        type: 'realtime',
        model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime',
        instructions: `${buildInstructions()} Supported languages: ${(config.supportedLanguages || ['en', 'hi', 'gu']).join(', ')}. At the start, call set_call_language with the detected caller language. Begin with this greeting: ${config.greeting || 'Welcome to TIMEORA. I am your AI assistant. How may I help you today?'}`,
        output_modalities: ['audio', 'text'],
        audio: {
          input: {
            format: { type: 'audio/pcmu' },
            transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad' },
          },
          output: { format: { type: 'audio/pcmu' }, voice: 'marin' },
        },
        tools: toolDefinitions,
        tool_choice: 'auto',
      },
    });
    if (pendingAudio.length) {
      pendingAudio.splice(0).forEach((audio) => sendJson(openAiSocket, { type: 'input_audio_buffer.append', audio }));
    }
  });

  twilioSocket.on('message', async (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      if (message.event === 'start') {
        streamSid = message.start?.streamSid;
        callSid = message.start?.callSid || callSid;
        callStates.set(callSid, { consented: false, confirmed: false, awaitingConsent: false, awaitingConfirmation: false, orderDraft: null });
        callStarted = true;
        await CallLog.findOneAndUpdate({ providerCallId: callSid }, {
          $set: { status: 'in-progress', outcome: 'answered' },
          $setOnInsert: { provider: 'twilio', source: message.start?.customParameters?.source === 'website' ? 'website' : 'phone', startedAt: new Date() },
        }, { upsert: true, new: true });
        if (sessionReady) sendJson(openAiSocket, { type: 'response.create', response: { instructions: 'Use the configured TIMEORA greeting. Identify yourself as an AI assistant, then ask how you can help. Detect the caller language and reply in it.' } });
      } else if (message.event === 'media' && openAiSocket.readyState === WebSocket.OPEN) {
        sendJson(openAiSocket, { type: 'input_audio_buffer.append', audio: message.media.payload });
      } else if (message.event === 'media' && pendingAudio.length < 50) {
        pendingAudio.push(message.media.payload);
      } else if (message.event === 'stop') {
        openAiSocket.close();
      }
    } catch {
      twilioSocket.close(1003, 'Invalid media frame');
    }
  });

  openAiSocket.on('message', async (raw) => {
    try {
      const event = JSON.parse(raw.toString());
      if (event.type === 'session.updated') {
        sessionReady = true;
        if (callStarted) sendJson(openAiSocket, { type: 'response.create', response: { instructions: 'Use the configured TIMEORA greeting. Identify yourself as an AI assistant, then ask how you can help. Detect the caller language and reply in it.' } });
      }
      if (event.type === 'response.output_audio.delta' && streamSid) {
        sendJson(twilioSocket, { event: 'media', streamSid, media: { payload: event.delta } });
      } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
        const state = callStates.get(callSid);
        const text = String(event.transcript || '').trim();
        if (state && isAffirmative(text)) {
          if (state.awaitingConsent) {
            state.consented = true;
            state.awaitingConsent = false;
          } else if (state.awaitingConfirmation) {
            state.confirmed = true;
            state.awaitingConfirmation = false;
          }
        } else if (state && /^(no|no thanks|i do not agree|ના|નહીં|नहीं|नही)[\s.!।,]*$/iu.test(text)) {
          state.awaitingConsent = false;
          state.awaitingConfirmation = false;
          state.confirmed = false;
        }
      } else if (event.type === 'response.done') {
        const functionCalls = (event.response?.output || []).filter(item => item.type === 'function_call');
        for (const functionCall of functionCalls) {
          let output;
          try {
            output = await handleToolCall(functionCall.name, JSON.parse(functionCall.arguments || '{}'), callSid);
          } catch (error) {
            output = { error: error.message || 'Unable to complete request' };
          }
          sendJson(openAiSocket, {
            type: 'conversation.item.create',
            item: { type: 'function_call_output', call_id: functionCall.call_id, output: JSON.stringify(output) },
          });
        }
        if (functionCalls.length) sendJson(openAiSocket, { type: 'response.create' });
      } else if (event.type === 'error') {
        console.error('[TIMEORA Voice] Realtime provider returned an error');
      }
    } catch {
      twilioSocket.close(1011, 'Voice processing failed');
    }
  });

  const closeBoth = () => {
    if (callSid) callStates.delete(callSid);
    if (openAiSocket.readyState === WebSocket.OPEN) openAiSocket.close();
    if (twilioSocket.readyState === WebSocket.OPEN) twilioSocket.close();
  };
  twilioSocket.on('close', closeBoth);
  twilioSocket.on('error', closeBoth);
  openAiSocket.on('error', closeBoth);
};

module.exports = { bridgeCall, buildInstructions, isAffirmative };