# Sonny Dispatch

An encrypted cyberpunk field journal with two AI companions — UNIT-7 (rogue AI) and KAI (ghost).

---

## Deploy in 4 steps

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Put this code on GitHub
1. Go to https://github.com and create a free account
2. Click "New repository" → name it `sonny-dispatch` → click "Create"
3. Upload all these files (drag and drop the folder)

### Step 3 — Deploy to Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New Project" → import your `sonny-dispatch` repo
3. Before clicking Deploy, go to "Environment Variables" and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from Step 1
4. Click Deploy — done in ~60 seconds

### Step 4 — Share it
Vercel gives you a free URL like `sonny-dispatch.vercel.app`
Share that link anywhere.

---

## How the 3-entry limit works
- Users get 3 free transmissions, tracked in their browser
- After 3 entries they see the locked screen with the "I LIKE IT" button
- The live counter shows how many people have clicked it
- No account needed — completely frictionless

## File structure
```
sonny-dispatch/
├── src/app/
│   ├── page.tsx          ← main journal UI
│   ├── layout.tsx        ← fonts, metadata
│   ├── globals.css       ← all styles
│   └── api/
│       ├── transmit/     ← AI companion responses (secure)
│       └── like/         ← live counter
├── public/
│   └── manifest.json     ← makes it installable on iPhone
├── package.json
├── next.config.js
└── tsconfig.json
```

## Upgrade path (when you're ready)
- **Persistent counter**: swap `/tmp` file storage in `api/like/route.ts` with Vercel KV (free tier)
- **User accounts**: add Clerk or Supabase Auth
- **Payments**: add Stripe for unlimited plan
- **More entries**: change `FREE_ENTRIES = 3` in `page.tsx`
