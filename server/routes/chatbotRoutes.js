const express = require('express');
const rateLimit = require('express-rate-limit');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ShippingConfig } = require('../models/Setting');
const { protect } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

const router = express.Router();
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Chat limit reached. Please wait a few minutes or call TIMEORA support.' },
});
const supportedLanguages = new Set(['en', 'hi', 'gu']);
const allowedGenders = new Set(['Men', 'Women', 'Unisex']);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const redactPrivateValues = (value) => value
  .replace(/\bTM-ORD-\d{6}\b/gi, '[order ID]')
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
  .replace(/(?:\+?\d[\d\s().-]{8,}\d)/g, '[phone number]');

const policyContext = (shipping) => [
  'TIMEORA store facts (use only these facts; do not invent details):',
  `Shipping configuration: standard shipping costs ₹${shipping.standardRate}, express shipping costs ₹${shipping.expressRate}, and orders at or above ₹${shipping.freeShippingThreshold} qualify for free shipping (the checkout backend applies these configured rates).`,
  'Checkout currently offers UPI/Razorpay, card, and cash on delivery (COD).',
  'The website advertises 30-Day Bespoke Returns and complimentary exchanges. Detailed eligibility, process, and exceptions are not published in the chatbot data; do not claim additional terms.',
  'No delivery timeframe is published in the available store data. Do not promise delivery dates or durations.',
  'If asked about a fact not present here, state that you cannot confirm it and offer the support phone number +91 8469965711.',
  'Never claim a product price, stock count, delivery promise, order status, or policy not provided by the application.',
].join('\n');

const sanitizeProducts = (products) => products.map((product) => ({
  id: String(product._id),
  name: product.name,
  gender: product.gender,
  category: product.categoryName || '',
  description: product.description,
  price: product.price,
  discountPrice: product.discountPrice && product.discountPrice < product.price ? product.discountPrice : null,
  effectivePrice: product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price,
  stock: product.stock,
  colors: product.colors || [],
  images: product.images || [],
}));

router.post('/message', chatLimiter, async (req, res) => {
  const { messages, language = 'en' } = req.body || {};
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12
    || !supportedLanguages.has(language)
    || messages.some((message) => !message || !['user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string' || message.content.length > 1000)) {
    return res.status(400).json({ success: false, message: 'Invalid chat message. Please try a shorter message.' });
  }
  if (!messages.some((message) => message.role === 'user')) {
    return res.status(400).json({ success: false, message: 'Please send a message to continue.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: 'AI chat is not configured yet. Please call TIMEORA support at +91 8469965711.',
    });
  }

  try {
    const shipping = await ShippingConfig.findOne().sort({ createdAt: -1 }).lean();
    const shippingFacts = {
      freeShippingThreshold: shipping?.freeShippingThreshold || Number(process.env.FREE_SHIPPING_THRESHOLD || 5000),
      standardRate: shipping?.standardRate || Number(process.env.SHIPPING_STANDARD || 200),
      expressRate: shipping?.expressRate || Number(process.env.SHIPPING_EXPRESS || 500),
    };
    const languageNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 450,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${policyContext(shippingFacts)}\n\nYou are TIMEORA's multilingual watch-shopping assistant. Respond in ${languageNames[language]}. Be concise, warm, and helpful. Ask one question at a time to learn the desired type/gender, budget, color, and style when helpful. Never say a product is available or quote its price unless the application provides a matching product. If a customer wants to track an order, ask for the order ID and explain that they must be signed in; never guess or disclose order/customer/admin data. For returns/exchanges, mention only the published 30-day returns and complimentary exchanges and say support can confirm detailed terms. For unknown facts, clearly say you cannot confirm them and offer support. Return only JSON with: {"reply": string, "search": {"requested": boolean, "gender": "Men"|"Women"|"Unisex"|null, "maxPrice": number|null, "color": string|null, "style": string|null}}. Set search.requested true only when the customer is asking to find/recommend/browse watches. Do not put product facts in reply unless the app has supplied them (it has not).`,
          },
          ...messages.slice(-10).map(({ role, content }) => ({ role, content: redactPrivateValues(content) })),
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!completion.ok) {
      logError('Chatbot AI request failed', { status: completion.status });
      return res.status(502).json({ success: false, message: 'The AI assistant is temporarily unavailable. Please try again or call TIMEORA support.' });
    }
    const completionData = await completion.json();
    const content = completionData.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ success: false, message: 'The AI assistant returned an invalid response. Please try again or call support.' });
    }

    let answer;
    try {
      answer = JSON.parse(content);
    } catch {
      logError('Chatbot AI returned invalid JSON');
      return res.status(502).json({ success: false, message: 'The AI assistant could not prepare a response. Please try again or call support.' });
    }
    if (typeof answer.reply !== 'string' || !answer.reply.trim()) {
      return res.status(502).json({ success: false, message: 'The AI assistant returned an incomplete response. Please try again or call support.' });
    }

    let products = [];
    const filters = answer.search || {};
    if (filters.requested === true) {
      const query = { isActive: true, stock: { $gt: 0 } };
      if (allowedGenders.has(filters.gender)) query.gender = filters.gender;
      if (Number.isFinite(filters.maxPrice) && filters.maxPrice >= 0) {
        query.$or = [
          { price: { $lte: filters.maxPrice } },
          { discountPrice: { $gt: 0, $lte: filters.maxPrice } },
        ];
      }
      const terms = [filters.color, filters.style]
        .filter((term) => typeof term === 'string' && term.trim())
        .map((term) => new RegExp(escapeRegex(term.trim().slice(0, 50)), 'i'));
      for (const term of terms) {
        query.$and = [...(query.$and || []), {
          $or: [
            { name: term },
            { categoryName: term },
            { description: term },
            { colors: term },
            { dialColor: term },
            { strapMaterial: term },
          ],
        }];
      }
      const matched = await Product.find(query).sort({ featured: -1, createdAt: -1 }).limit(6)
        .select('name gender categoryName description price discountPrice stock colors images').lean();
      products = sanitizeProducts(matched);
    }

    let reply = answer.reply.trim().slice(0, 1600);
    if (filters.requested === true && products.length === 0) {
      const noResults = {
        en: 'I could not find an available match in the live catalog for those preferences. Try changing your preferences or contact TIMEORA support.',
        hi: 'उन पसंदों के लिए लाइव कैटलॉग में कोई उपलब्ध घड़ी नहीं मिली। पसंद बदलकर देखें या TIMEORA सहायता से संपर्क करें।',
        gu: 'આ પસંદગી માટે લાઇવ કેટલોગમાં ઉપલબ્ધ ઘડિયાળ મળી નથી. પસંદગી બદલીને જુઓ અથવા TIMEORA સહાયનો સંપર્ક કરો.',
      };
      reply = noResults[language];
    }
    return res.json({ success: true, reply, products });
  } catch (error) {
    logError(error);
    return res.status(502).json({ success: false, message: 'The assistant could not complete that request. Please try again or call TIMEORA support.' });
  }
});

router.post('/track', protect, async (req, res) => {
  const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId.trim().toUpperCase() : '';
  if (!/^TM-ORD-\d{6}$/.test(orderId)) {
    return res.status(400).json({ success: false, message: 'Enter a valid TIMEORA order ID (for example, TM-ORD-123456).' });
  }
  try {
    const order = await Order.findOne({ orderId, user: req.user._id })
      .select('orderId status createdAt items.name items.quantity trackingInfo.carrier trackingInfo.trackingNumber trackingInfo.trackingUrl')
      .lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'We could not find that order in your account. Check the ID or contact TIMEORA support.' });
    }
    return res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        createdAt: order.createdAt,
        items: (order.items || []).map(({ name, quantity }) => ({ name, quantity })),
        tracking: order.trackingInfo?.trackingUrl ? {
          carrier: order.trackingInfo.carrier || '',
          trackingNumber: order.trackingInfo.trackingNumber || '',
          trackingUrl: order.trackingInfo.trackingUrl,
        } : null,
      },
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({ success: false, message: 'Order tracking is temporarily unavailable. Please try again or contact support.' });
  }
});

module.exports = router;
