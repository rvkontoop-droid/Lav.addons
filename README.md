# FiveM Addons Hub

A modern, Discord-integrated website for managing and sharing FiveM addons.

## Features

- 🔐 Discord OAuth2 Authentication
- 👑 Role-based upload permissions
- 🎨 Dark theme with modern UI
- 📱 Fully responsive design
- 🔍 Search and filter functionality
- 📤 Easy addon upload system

## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/fivem-addons-site)

## Environment Variables

After deployment, set these environment variables in Netlify:

\`\`\`env
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=your-secret-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
DISCORD_UPLOAD_ROLE_ID=your-role-id
\`\`\`

## Discord Setup

1. Create Discord Application at https://discord.com/developers/applications
2. Add redirect URI: `https://your-site.netlify.app/api/auth/callback/discord`
3. Create bot and add to your server
4. Get role ID for upload permissions

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000
