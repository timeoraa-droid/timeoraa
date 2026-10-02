# TIMEORA | Luxury Horlogerie E-Commerce Platform

Production-ready, single-brand full-stack e-commerce website for **TIMEORA** luxury watches.

---

## Brand Architecture & Customization

All brand information, taglines, color palettes, currencies, and contact details are centralized in a single configuration file for easy changes:

- **Frontend Brand Settings:** [`client/src/config/brandConfig.js`](client/src/config/brandConfig.js)
  - Change brand name: `name: "TIMEORA"`
  - Change tagline: `tagline: "Time That Defines You"`
  - Change currency: `currency: "$"`
  - Change colors: Champagne gold accents (`#c5a880`), dark midnight slate (`#0b0b0d`)

---

## Features & Pages Included

### 18 Complete Frontend Pages:
1. **Home (`/`)**: Cinematic luxury hero section, curated featured timepieces, collections showcase (Men & Women), horological craftsmanship pillars, collector testimonials, and VIP gazette newsletter.
2. **All Watches (`/watches`)**: Complete catalog grid with dynamic live filtering (Gender, Category, Maximum Price slider), instant keyword search, and sorting (Featured, Newest, Price Low-High, Price High-Low, Popularity).
3. **Men's Watches (`/men`)**: Pre-filtered masculine Haute Horlogerie chronographs and diver tools.
4. **Women's Watches (`/women`)**: Pre-filtered diamond-set, mother-of-pearl, and ultra-slim editions.
5. **New Arrivals (`/new-arrivals`)**: Latest releases from the Geneva atelier.
6. **Best Sellers (`/best-sellers`)**: The most celebrated and iconic timepieces.
7. **Product Details (`/product/:id`)**: Multi-angle image gallery with interactive thumbnail switching, pricing with discounts, color finish variant selector, detailed technical specifications table (movement, case, strap, water resistance, warranty), and related timepieces.
8. **Shopping Bag (`/cart`)**: Complete cart overview, coupon code redemption (`ROYAL10` for 10% privilege discount), line item controls, and subtotal calculation.
9. **Secure Checkout (`/checkout`)**: Dispatch address, courier selection (Express / Armored Priority), payment authorization (Credit Card, Bank Wire, Concierge COD).
10. **Order Success (`/order-success`)**: Order certification reference, delivery timeline, purchased items summary, and tracking prompt.
11. **Sign In (`/login`)**: Patron login with email/password validation and instant 1-click VIP Demo login.
12. **Register (`/register`)**: Patron registration with validation and account creation.
13. **Patron Account (`/account`)**: Collector tier status, recent order history, active warranties, and saved addresses.
14. **My Orders (`/orders`)**: Provenance tracking for past acquisitions with individual status indicators.
15. **About Us (`/about`)**: The heritage of TIMEORA, atelier philosophy, and standards of precision.
16. **Contact Us (`/contact`)**: Private horological concierge inquiry form and private viewing salon bookings.
17. **Wishlist (`/wishlist`)**: Curated personal favorites with 1-click move to shopping bag.
18. **404 Page (`*`)**: Bespoke "Lost in Time" luxury error page.

### Interactive Components & Overlays:
- **Slide-out Cart Drawer**: Instant slide-out review on adding items from any page.
- **Interactive Quick View Modal**: Preview specs and add to bag without leaving the listing page.
- **Live Search Overlay**: Instant keyboard search with keyword suggestions.
- **Fixed Luxury Navbar**: Dynamic backdrop blur on scroll, mobile drawer navigation, live item count badges.

---

## Tech Stack

### Frontend:
- **React 19** + **Vite 8**
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **React Router 7**
- **Lucide React** (Vector icons)
- **Axios** (API requests)
- **Context API** (`CartContext`, `WishlistContext`, `AuthContext`)

### Backend:
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose** for the verified live catalog, orders, and voice call records
- **JWT (JSON Web Tokens)** for authenticated sessions
- **bcryptjs** for secure password hashing
- **Multer** for product image uploads
- **CORS** + **dotenv**

---

## How to Run in VS Code

### Run Frontend and Backend Together:
```bash
cd watch-store
npm install --prefix server
npm install --prefix client
npm run dev
```
Open **http://localhost:5173/home** in your browser. This command starts the Vite client and Express API together.

To run them in separate terminals instead:
```bash
cd watch-store
npm run server
```
```bash
cd watch-store
npm run client
```
The API runs on **http://localhost:5000**. Check **http://localhost:5000/api/status**.

## AI Voice Support Setup

The voice feature is optional. It uses Twilio Voice for browser/phone audio and OpenAI Realtime for the AI conversation. Without credentials, website calls show that calling is unavailable and inbound phone requests return an unavailable response; no successful call is simulated. Product, stock, and price answers come from MongoDB. Order status requires the order reference, phone number, and postal code. The assistant only creates a COD order after the customer explicitly confirms the reviewed order.

### Install and configure

1. From the `watch-store` folder, install dependencies:

  ```bash
  npm install --prefix server
  npm install --prefix client
  ```

  `twilio` mints short-lived server-side Voice SDK tokens and validates Twilio webhook signatures. `ws` carries Twilio media to the server-side OpenAI Realtime connection. `@twilio/voice-sdk` handles website microphone calls.

2. Copy `server/.env.example` to `server/.env` (`Copy-Item server/.env.example server/.env` in PowerShell). Keep secrets only in backend environment variables. Website calling requires `OPENAI_API_KEY`, the Twilio account/API credentials, `TWILIO_VOICE_APP_SID`, `TWILIO_PUBLIC_BASE_URL`, and `VOICE_STREAM_BASE_URL`. `VOICE_STREAM_BASE_URL` must point to a public WSS-capable Node server running this project. Do not add provider credentials to frontend variables or commit `server/.env`.

3. In Twilio Console, configure the TwiML Voice Application's Voice URL as `https://YOUR_PUBLIC_API_HOST/api/voice/twiml` using `POST`. Configure call status callbacks as `https://YOUR_PUBLIC_API_HOST/api/voice/status` using `POST`. The app mints short-lived browser tokens; the Voice Application SID is kept on the server.

4. The website-call button is enabled only when credentials and a WSS stream host are configured. Incoming calls are reported ready only after the backend confirms via the Twilio API that `TWILIO_PHONE_NUMBER_SID` is voice-capable, is exactly `+918469965711`, and points to the configured POST voice URL. Add the number in Twilio only if Twilio/provider rules allow it; do not change, port, or forward your current mobile line without your separate approval. A personal/mobile number may need forwarding, porting (if eligible), or a separate provider number, subject to carrier approval and Indian number availability.

5. For local provider testing, expose the Node server using a trusted HTTPS/WSS tunnel. Set `TWILIO_PUBLIC_BASE_URL` to the exact public HTTPS origin that Twilio calls, and set `VOICE_STREAM_BASE_URL` to its WSS origin (or to a separately hosted persistent Node stream service). Twilio signatures are validated against the externally configured webhook URL. Never use a self-signed production TLS certificate.

6. Configure Vercel's project root as `watch-store`. The site defaults to same-origin `/api` routes; set `VITE_API_URL` to the backend HTTPS origin (origin only, no `/api` suffix) when hosting Express separately. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and other backend variables in the API deployment environment. The Vercel entry exports the Express HTTP handler and connects MongoDB before API requests. Without a working MongoDB connection, API routes return a clear 503 instead of serving a false empty catalog.

7. Run `server/server.js` on a persistent Node host for voice/media WebSocket upgrades and point `VOICE_STREAM_BASE_URL` at that host. The storefront's regular HTTP API may remain on Vercel or use that same backend through `VITE_API_URL`. The admin panel reports calls unavailable until the full provider/stream configuration is present.

8. Sign in with an admin account and open `/admin` to view call history, outcomes, handoff requests, voice-created orders, configure greeting/languages, and see provider-confirmed phone readiness. Call records do not contain recordings or full transcripts. Admin endpoints require the existing admin JWT.

## AI Shopping Chatbot Setup

The floating TIMEORA chat is available across the storefront in English, Hindi, and Gujarati. It uses the server-side `OPENAI_API_KEY` (model configurable with `OPENAI_CHAT_MODEL`, default `gpt-4o-mini`); never expose either value through a `VITE_` frontend variable. Without the key, AI chat returns a clear setup/support message rather than simulated AI replies.

Watch recommendations are queried from active, in-stock MongoDB products using the customer's budget, gender, color, and style preferences. Order lookup requires the existing customer sign-in and searches only orders owned by that authenticated account; order IDs and obvious email/phone values are excluded or redacted from the AI conversation. Only a minimal order status/items/tracking summary is returned. Shipping prices/threshold are read from the store's shipping configuration. The assistant only states published return/exchange facts and does not promise delivery dates or invent policy terms. For the existing storefront's general support line, the chat's call action uses the configured number in `client/src/config/brandConfig.js`.

Use the server environment variable setup above, then run `npm run dev --prefix server` and `npm run dev --prefix client` from `watch-store`. An authenticated customer order is required to test successful tracking; use the actual order ID created by the existing checkout.

### Admin sign-in and first-time setup

The **User** choice opens user sign-in. On that screen, choose **Create an account** to register; new registrations always receive the customer role. The **Admin** choice accepts an admin login ID or the admin account email.

To create or update the admin account locally, add `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, and a temporary `ADMIN_INITIAL_PASSWORD` to `server/.env` (an optional `ADMIN_NAME` sets the display name), then run from the `watch-store` folder:

```bash
npm run setup:admin --prefix server
```

The script hashes the password using the existing User model, will not promote a customer account, and prints no password. Remove `ADMIN_INITIAL_PASSWORD` from `server/.env` immediately after it reports success. Use a unique password and rotate any password that has been shared in chat; do not use a sample or previously disclosed password for a live store.

### Tests and compliance

Run backend voice tests with `npm test --prefix server`, existing backend smoke tests with `node server/test/runTests.js`, and build the frontend with `npm run build --prefix client` from `watch-store`.

The storefront shows only products returned by the live database. An empty catalog is shown as empty; it does not substitute demo prices or stock. Admin product create/edit requires an actual saved image and the admin enters actual stock. Call audio is relayed to the configured voice providers for the live session; this app does not save audio recordings or full transcripts. Confirm provider retention/data residency and applicable Indian telecom, privacy, AI disclosure, consent, number registration, calling hours, and escalation requirements with your providers/legal adviser. Human handoff currently creates an admin-visible follow-up request; it does not transfer a live call to an agent. Vercel's filesystem is not durable for uploaded images; use an external object-storage image URL or configure durable object storage before relying on uploads in production.
