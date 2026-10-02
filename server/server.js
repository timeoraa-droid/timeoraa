const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const CallLog = require('./models/CallLog');
const { bridgeCall } = require('./services/voiceBridge');
const { isVoiceConfigured } = require('./routes/voiceRoutes');
const WebSocket = require('ws');
const twilioVoice = require('./providers/twilioVoice');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

let databaseConnection;
const ensureDatabaseConnection = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!databaseConnection) {
    databaseConnection = connectDB().finally(() => { databaseConnection = null; });
  }
  await databaseConnection;
};

app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  try {
    await ensureDatabaseConnection();
    next();
  } catch {
    res.status(503).json({ success: false, message: 'Database service is temporarily unavailable. Please try again later.' });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many payment requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-email', authLimiter);
app.use('/api/payment', paymentLimiter);
app.use('/api/webhooks/razorpay', paymentLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'TIMEORA API is running' });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    brand: 'TIMEORA Horlogerie & Co.',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes').router);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const createVoiceServer = () => {
  const voiceServer = http.createServer(app);
  const voiceSockets = new WebSocket.Server({ noServer: true, maxPayload: 1024 * 1024 });
  voiceServer.on('upgrade', async (request, socket, head) => {
    const requestUrl = new URL(request.url, 'http://localhost');
    if (requestUrl.pathname !== '/api/voice/stream') return socket.destroy();
    const callSid = requestUrl.searchParams.get('callSid') || '';
    if (!isVoiceConfigured() || !twilioVoice.validateWebsocketRequest(request)
      || !/^CA[A-Za-z0-9]{10,40}$/.test(callSid)) return socket.destroy();
    try {
      await ensureDatabaseConnection();
      const call = await CallLog.findOne({ providerCallId: callSid, status: 'in-progress' }).select('_id').lean();
      if (!call) return socket.destroy();
      voiceSockets.handleUpgrade(request, socket, head, (websocket) => {
        voiceSockets.emit('connection', websocket, request);
      });
    } catch {
      socket.destroy();
    }
  });
  voiceSockets.on('connection', bridgeCall);
  return voiceServer;
};

const startServer = async () => {
  try {
    await connectDB();
  } catch (dbError) {
    console.warn('[TIMEORA] MongoDB connection failed. Server starting without database access.');
    console.warn(`[TIMEORA] Database error type: ${dbError.name || 'Error'}`);
  }

  server = createVoiceServer();
  server.listen(PORT, () => {
    console.log('\n=================================================');
    console.log('  TIMEORA Horlogerie Backend Server Running');
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'} `);
    console.log(`  Port: ${PORT}                                  `);
    console.log(`  URL:  http://localhost:${PORT}/api/status     `);
    console.log('=================================================\n');
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, createVoiceServer, server };
