# TIMEORA Deployment Guide

## Local Development

Requirements: Node.js 20+, npm, and a MongoDB Atlas or local MongoDB database.

From the `watch-store` folder:

```powershell
npm install --prefix server
npm install --prefix client
Copy-Item server/.env.example server/.env
npm run dev
```

Open `http://localhost:5173/home`. The Express API is on `http://localhost:5000`; health check: `http://localhost:5000/api/status`. The Vite client uses port 5000 automatically in development. Set `VITE_API_URL` only when the API is hosted at another origin; use the origin without `/api` or a trailing slash.

To run separately, use `npm run server` and `npm run client` in two terminals, both from `watch-store`.

## Vercel Frontend and HTTP API

Set the Vercel project root to `watch-store` and deploy `main`. The repository's `vercel.json` builds `client/` and rewrites `/api/*` to `api/index.js`. That entry exports the Express request handler and connects MongoDB before API requests. Set `MONGODB_URI` (or `MONGO_URI`) to the Atlas connection string and allow network access from the deployment environment. The API returns HTTP 503 when MongoDB is not configured or cannot be reached; it does not report an empty/fake catalog.

Configure these server-side Vercel environment variables for standard HTTP features: `MONGODB_URI`, a strong `JWT_SECRET`, `CLIENT_URL` set to the deployed site origin, and any payment/email settings the store uses. `VITE_API_URL` may be left unset to use same-origin `/api`; set it to an HTTPS API origin only when the backend is hosted separately. Vite variables are public; never put secrets in a `VITE_` variable.

The Vercel HTTP function exports the Express app. Run `server/server.js` on a persistent Node host for voice/media WebSocket upgrades; point `VOICE_STREAM_BASE_URL` at that host. The website can continue using the Vercel HTTP API for standard requests. The app does not claim voice readiness just because the Vercel site is deployed.

Vercel's filesystem is not durable for product uploads. Product records can store externally hosted image URLs. Use durable object storage before relying on local upload files in production.

## AI Voice Provider Setup

Voice is disabled until the provider is configured. Copy `server/.env.example` to `server/.env` locally, or set the same values in the backend host's secret manager. Required website voice values include `OPENAI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_AUTH_TOKEN`, `TWILIO_VOICE_APP_SID`, `TWILIO_PUBLIC_BASE_URL`, and `VOICE_STREAM_BASE_URL`.

`TWILIO_PUBLIC_BASE_URL` is the public HTTPS origin receiving the Twilio-signed `/api/voice/twiml` and `/api/voice/status` requests. `VOICE_STREAM_BASE_URL` is the public secure WebSocket origin hosting `/api/voice/stream`; it must be the actual running `server/server.js` service or another persistent deployment of this backend. Twilio signature checks use the externally visible URL. Use HTTPS/WSS with a publicly trusted certificate.

In Twilio Console:

1. Create an API key and a Programmable Voice application. Set its Voice URL to `https://YOUR_API_HOST/api/voice/twiml` with `POST`.
2. Configure call status callbacks to `https://YOUR_API_HOST/api/voice/status` with `POST`.
3. For inbound calls, assign a voice-capable number and configure its voice URL and status callbacks to those endpoints.
4. Set `TWILIO_PHONE_NUMBER=+918469965711` and `TWILIO_PHONE_NUMBER_SID=PN...` only after the provider shows that exact number is provisioned with voice capability and its Voice URL is the configured TIMEORA webhook. The backend checks the Twilio resource and does not report phone AI as ready on a mere environment-variable match.

Your existing `8469965711` link only dials the phone number. It does not route a call to AI. If it is a personal mobile number, AI answering may require carrier-approved forwarding, number porting (if eligible), or a separate provider number. This project does not alter your service; choose and approve any number change with your carrier/provider.

On production, place the Twilio credentials and OpenAI key in the backend secret manager. If Vercel serves the frontend but a separate persistent Node service handles API and calls, set Vercel's `VITE_API_URL` to that backend's HTTPS origin, configure backend `CLIENT_URL` to the Vercel site origin, and point both Twilio webhook URLs and `VOICE_STREAM_BASE_URL` at the backend. Do not commit `.env` files.

## Admin Catalog and Voice Operations

Create products in `/admin` using the existing admin login. Enter the actual price and stock and add the real product images; the public site no longer falls back to sample product prices or inventory. New category names are stored in MongoDB when the admin adds a product. The admin voice panel lists calls, order outcomes, handoff requests, greeting/language settings, and the separately verified phone readiness status.

## Verification

```powershell
npm test --prefix server
node server/test/runTests.js
npm run build --prefix client
```

Voice tests cover product lookup, verified order checks, confirmation/idempotency, provider signatures, and authorization. A real call must still be test-called with configured credentials, a reachable public endpoint, and a microphone before being treated as production-ready.

Before enabling live calls, confirm Twilio/AI service availability for India, number eligibility, provider retention/data residency, customer AI disclosure and consent, calling-hour rules, privacy obligations, escalation procedures, and any applicable telecom requirements with the provider and legal adviser. The human handoff feature currently creates an admin-visible follow-up request; it does not transfer the active call to a human agent. Recordings/full transcripts are not persisted by this app.
