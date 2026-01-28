# Setup Instructions

## Issue: npm Cache Mode

If you're encountering `ENOTCACHED` errors, npm is configured to use cache-only mode. Here's how to fix it:

## Quick Fix

1. **Check npm configuration:**
   ```bash
   npm config get cache
   ```

2. **Reset npm cache settings:**
   ```bash
   npm config delete cache
   npm config set prefer-offline false
   ```

3. **Or use yarn instead (if available):**
   ```bash
   yarn install
   yarn dev
   ```

## Manual Setup Steps

1. **Navigate to frontend directory:**
   ```bash
   cd C:\Users\I.q\Desktop\FYP\frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   If that fails, try:
   ```bash
   npm install --no-cache
   ```
   
   Or use yarn:
   ```bash
   yarn install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env.local
   ```
   
   Then edit `.env.local` and set:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Or with yarn:
   ```bash
   yarn dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`

## Alternative: Use Yarn

If npm continues to have issues:

1. **Install Yarn (if not installed):**
   ```bash
   npm install -g yarn
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Run dev server:**
   ```bash
   yarn dev
   ```

## Troubleshooting

### If dependencies fail to install:
- Check your internet connection
- Try clearing npm cache: `npm cache clean --force`
- Check npm registry: `npm config get registry` (should be https://registry.npmjs.org/)
- Try using a different registry or VPN if you're behind a firewall

### If the app doesn't start:
- Make sure Node.js version is 18+ (check with `node --version`)
- Make sure port 3000 is not in use
- Check for TypeScript errors: `npm run type-check`

## Project Structure

The project is ready with:
- ✅ All components created
- ✅ Pages implemented (Home, Login, Register, Trips)
- ✅ Component library with reusable components
- ✅ TypeScript types and DTOs
- ✅ API service layer
- ✅ SEO utilities

Just install dependencies and run!
