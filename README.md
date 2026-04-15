# Patterns of Place - One-Time QR Code Backend

A Next.js + Supabase backend for generating and validating one-time-use QR codes.

## Features

- ✅ Secure one-time QR code generation
- ✅ Atomic token validation (prevents race conditions)
- ✅ Token expiry enforcement
- ✅ Scan tracking and analytics
- ✅ RESTful API for code generation and redemption
- ✅ React component for QR display

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run the schema from [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. Copy your API keys from **Project Settings > API**

### 3. Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
SUPABASE_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
QR_TOKEN_EXPIRY_HOURS=24
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=Patterns of Place <onboarding@resend.dev>
```

Compatibility note: the app also accepts legacy key names (`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`) if you already use them.

For email delivery, add a Resend API key. The default sender works for local testing; for production, use a verified sender domain.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open Patterns of Place.

Generate a postcard in Finalize stage, click **Generate QR Download**, and scan once to open a one-time download page for both front and reverse SVG files.

To email a postcard link, enter a recipient email in Finalize and click **Send via Email**.

## API Endpoints

### Create a QR Code

**POST** `/api/qr-codes`

Request:

```json
{
  "redirectUrl": "https://your-app.com/page",
  "metadata": { "campaign": "summer-2024" }
}
```

Response:

```json
{
  "id": "uuid-here",
  "qrUrl": "http://localhost:3000/qr/token-hash",
  "token": "raw-token-for-display",
  "expiresAt": "2024-04-16T10:20:30.000Z"
}
```

### Validate/Redeem a QR Code

**GET** `/api/qr/[token]`

Success Response (status 200):

```json
{
  "status": "success",
  "message": "QR code validated successfully",
  "redirectUrl": "https://your-app.com/page",
  "payload": { "campaign": "summer-2024" }
}
```

Already Used Response (status 410):

```json
{
  "error": "QR code has already been used",
  "status": "already-used",
  "usedAt": "2024-04-15T12:00:00.000Z"
}
```

## QR Download Flow (Patterns of Place)

1. In Finalize stage, the app builds front and reverse SVG strings.
2. It calls `POST /api/qr-codes` and stores those SVGs in `qr_codes.payload`.
3. The API returns a one-time URL like `/qr/<token>`.
4. Scanning `/qr/<token>` redeems the token via `GET /api/qr/[token]`.
5. The token page exposes buttons to download both SVG files.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── qr-codes/          # Create endpoint
│   │   └── qr/[token]/        # Validate endpoint
│   ├── components/
│   │   └── QRGenerator.tsx     # React component
│   └── page.tsx               # Home page
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── tokenUtils.ts          # Token generation
```

## Security Considerations

- Tokens are hashed before storage (raw token only in URL)
- Atomic database updates prevent race conditions
- Service role key stored server-side only
- Rate limiting recommended for production
- Deploy on Vercel for automatic HTTPS

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
npm run build
```

## Next Steps

- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add analytics dashboard
- [ ] Set up automatic token cleanup job
- [ ] Add Vercel Edge Functions for global QR validation
