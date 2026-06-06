# Lunch Randomiser

A small Netlify-hosted app that picks a random lunch spot, shows Google Maps details, and lets anyone with the link add new places.

## Features

- **I'm hungry** — one random pick per day from `public/spots.json`
- **Google Maps** — photo and embedded map when a place is found
- **Spin again** — one reroll per UK calendar day; the second pick never repeats the first
- **Add a new spot** — form that commits updates to `spots.json` in your GitHub repo

## Before you deploy

### 1. Add your five lunch spots

Edit [`public/spots.json`](public/spots.json) and replace the placeholder entries with your real spots:

```json
{
  "spots": [
    {
      "id": "dadash",
      "name": "Dadash",
      "address": "Hackney Road, London E2 7SJ"
    }
  ]
}
```

Use a unique `id` for each spot (lowercase letters, numbers, and hyphens).

### 2. Google Maps API key

In [Google Cloud Console](https://console.cloud.google.com/):

1. Enable **Maps JavaScript API**, **Places API**, and **Maps Embed API**
2. Create an API key
3. Restrict it by HTTP referrer to your Netlify domain (and `http://localhost:*` for local dev)

Create a local `.env` file:

```bash
cp .env.example .env
```

Set `VITE_GOOGLE_MAPS_API_KEY` in `.env` and in Netlify → Site settings → Environment variables.

### 3. GitHub repo + token (for “Add a new spot”)

The add-spot form uses a Netlify Function to commit changes to `public/spots.json`.

1. Push this project to a GitHub repository
2. Create a fine-grained or classic personal access token with `repo` scope
3. In Netlify, set these environment variables:

| Variable | Example |
|----------|---------|
| `GITHUB_TOKEN` | `ghp_...` |
| `GITHUB_OWNER` | `your-username` |
| `GITHUB_REPO` | `lunch-randomiser` |
| `GITHUB_BRANCH` | `main` |

After each add, Netlify rebuilds automatically. The app also updates immediately in the browser.

### 4. Deploy to Netlify

1. Connect your GitHub repo in Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the environment variables above

## Local development

```bash
npm install
npm run dev
```

For testing the add-spot function locally:

```bash
npx netlify dev
```

`netlify dev` runs Vite and the serverless function together on port 8888.

## Daily pick rules

- Resets at midnight UK time (`Europe/London`)
- Stored in the browser (`localStorage`), so it is per device
- One **I'm hungry** pick per day — once chosen, that result stays until tomorrow
- One **Spin again** per day; the button disappears after use
- The second pick always excludes the first result
