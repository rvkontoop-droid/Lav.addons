# Deployment Guide for ŁAF | لـاَف FiveM Addons Hub

## Current Status
This is a **demo version** that uses in-memory storage. Uploaded addons will be reset on each deployment.

## For Production Deployment

### Option 1: Supabase (Recommended)
1. Create a Supabase project at https://supabase.com
2. Create an `addons` table:
\`\`\`sql
CREATE TABLE addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  download_url TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  author JSONB NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE,
  downloads INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  tags TEXT[]
);
\`\`\`
3. Add environment variables:
\`\`\`env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

### Option 2: PlanetScale
1. Create a PlanetScale database
2. Use Prisma or direct MySQL queries
3. Add connection string to environment variables

### Option 3: Vercel KV (Redis)
1. Enable Vercel KV in your project
2. Use Redis for fast storage
3. Automatic environment variable setup

## Environment Variables Required
\`\`\`env
# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Discord OAuth
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret

# Discord Bot & Server
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
DISCORD_UPLOAD_ROLE_ID=1383315641632555018

# Database (choose one)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
# OR
DATABASE_URL=your-database-url
\`\`\`

## Discord Setup
1. Create Discord Application
2. Set OAuth redirect: `https://your-domain.com/api/auth/callback/discord`
3. Create bot with proper permissions
4. Add bot to your Discord server
5. Create "Addons Team" role with ID: 1383315641632555018

## Deployment Steps
1. Fork this repository
2. Deploy to Vercel
3. Set environment variables
4. Configure Discord OAuth
5. Test upload functionality

The website will be fully functional once you connect a real database!
