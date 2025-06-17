# The DECK deck

A web application for drawing cards from [Hallelujah The Hills' DECK project](https://www.hallelujahthehills.com/music/deck/) to create custom audio tarot readings.

[deck.hallelujahthehills.com](https://deck.hallelujahthehills.com)

## Features

- Draw up to 13 cards from a 54-card deck (52 standard cards + 2 jokers)
- Each card corresponds to a unique song from the DECK albums
- Direct links to streaming platforms: Apple Music, Bandcamp, Spotify, YouTube Music
- Save and share your "pulls" via URL

## Technology

- Vue 3 single page application
- End-to-end testing with Playwright
- Static site deployed to Netlify
- No backend required - all data stored locally in browser
- Mobile-first responsive design

## Development

This project uses the Netlify CLI for local development and deployment.

### Local Development

Install dependencies:

```bash
npm install
npx playwright install
```

Start local development server:

```bash
netlify dev
```

Run E2E tests:

```bash
npx playwright test
```

### Deployment

Deploy preview:

```bash
netlify deploy
```

Deploy to production:

```bash
netlify deploy --prod
```

---

We love you. Good luck.
