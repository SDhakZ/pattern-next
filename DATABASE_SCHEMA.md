# Supabase Database Schema

## QR Codes Table

Run this SQL in your Supabase SQL editor to create the `qr_codes` table:

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  redirect_url TEXT NOT NULL,
  payload JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  scan_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX idx_qr_codes_token_hash ON qr_codes(token_hash);
CREATE INDEX idx_qr_codes_status ON qr_codes(status);
CREATE INDEX idx_qr_codes_expires_at ON qr_codes(expires_at);

-- Enable RLS if needed
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
```

## Optional: QR Scans Log Table

For detailed analytics, run this to track all scans:

```sql
CREATE TABLE qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'expired', 'already-used', 'invalid'))
);

CREATE INDEX idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at);
```

## Row Level Security (RLS) Policies

If you want to add RLS policies (recommended for production):

```sql
-- Allow anyone to read their own QR codes (if you add user_id later)
-- Allow service role to insert and update
CREATE POLICY "Service role can manage QR codes"
  ON qr_codes
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Setup Steps in Supabase Dashboard

1. Go to your Supabase project
2. Open the SQL Editor
3. Paste the SQL above
4. Click "Run"
5. Verify the tables appear in the "Table Editor"
6. Copy your API keys from Project Settings > API
7. Add them to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL` (from Settings > API > URL)

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (from Settings > API > publishable key)
- `SUPABASE_SECRET_KEY` (from Settings > API > secret key)

Legacy compatibility:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works as a fallback.
- `SUPABASE_SERVICE_ROLE_KEY` still works as a fallback.
