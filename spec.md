# DECK Card Draw Web App - Developer Specification

## Project overview

This web application allows users to draw cards from Hallelujah the Hills' DECK project to create custom playlists. DECK consists of 52 songs (one for each standard playing card) plus 2 joker songs, totaling 54 songs across 4 albums.

**Project context:** <https://www.hallelujahthehills.com/news/deck-is-real/>

## Core functionality

### Card drawing mechanics

- Users draw cards one at a time by clicking a face-down deck
- Maximum 13 cards per "pull" (session)
- No duplicate cards allowed - once drawn, cards are removed from available pool
- 54 total cards: standard 52-card deck + 2 jokers

### Session management

- Sessions are called "pulls"
- Users can save multiple pulls in browser storage
- Pulls are shareable via URL parameters
- No backend data storage required

## User interface requirements

### Layout design

- **Mobile-first responsive design**
- Matches visual aesthetic of hallelujahthehills.com
- Wide viewport: deck positioned on side
- Mobile viewport: deck at top, content stacked vertically

### Card display

- **Vertical list layout** for drawn cards
- Card artwork on left, song title on right
- Each card paired with complete song title (includes card name)
- Song title format: `"Song Name (Card Name)"`

### Deck interaction

- Face-down deck of cards that users click to draw
- Deck maintains same visual size regardless of cards drawn
- When 13 cards reached: deck becomes disabled
- "New pull" button appears on top of disabled deck

### Streaming integration

- **Individual controls**: Each song has icon links for streaming services
- **Global controls**: "Export playlist to:" followed by streaming service icons
- **Supported platforms**: Spotify, Bandcamp, Apple Music, YouTube Music
- **Implementation**: Direct links to each platform (simple search URLs)

### Navigation

- "Previous pulls" menu showing saved sessions
- Format: "X cards on MM/DD/YY" (e.g., "5 cards on 1/15/25")
- Clicking a previous pull loads it as current active session

## Technical architecture

### Technology stack

- **Vue 3 Single Page Application**
- Built to static files for hosting anywhere
- No backend required

### Data structure

Embedded JavaScript object in main component:

```javascript
const DECK = {
  "AD": "Gimme Midnight (Ace of Diamonds)",
  "2D": "Joke's on You (2 of Diamonds)",
  "3D": "Fake Flowers at Sunset (3 of Diamonds)",
  // ... continue for all 52 standard cards
  "J1": "[Joker 1 song title]",
  "J2": "[Joker 2 song title]"
}
```

**Card code format:**

- Standard cards: `AD`, `2D`, `3D`...`KD` (Diamonds), `AC`, `2C`...`KC` (Clubs), etc.
- Jokers: `J1`, `J2`

### Asset organization

```
/public/
  /assets/
    /cards/
      AD.jpg
      2D.jpg
      3D.jpg
      ...
      J1.jpg
      J2.jpg
```

Card artwork path construction: `/assets/cards/${cardCode}.jpg`

### URL structure

- **Current pull state**: `?pull=AD,2D,7H`
- Comma-separated list of card codes
- Shared URLs become active sessions when accessed

### Local storage

- Save pulls in browser localStorage
- No user accounts or backend persistence
- Pull data includes: card codes, timestamp, card count

## Component architecture

### Main Vue component structure

- **Deck component**: Clickable face-down deck, disabled state
- **Card list component**: Vertical list of drawn cards with artwork and titles
- **Streaming links component**: Individual and global streaming service links
- **Pull menu component**: Dropdown/menu of previous pulls
- **URL handler**: Parse/update URL parameters on state changes

### State management

- Track drawn cards array in component state
- Update URL parameters on each card draw
- Load state from URL parameters on app initialization
- Save/restore pulls from localStorage

### Key functions needed

- `drawRandomCard()`: Select random card from remaining deck
- `updateURL()`: Sync current pull state to URL parameters
- `savePull()`: Store current pull in localStorage
- `loadPull()`: Restore pull from localStorage or URL
- `generateStreamingLinks()`: Create platform-specific URLs for songs

## Streaming service integration

**Note: Streaming integration will be added in a future phase. The initial app will be built without streaming functionality.**

### Integration options explored

**Option 1: Search URLs (Simplest)**
Generate search URLs for each platform:

- **Spotify**: `https://open.spotify.com/search/[encoded song title]`
- **Apple Music**: `https://music.apple.com/search?term=[encoded song title]`
- **YouTube Music**: `https://music.youtube.com/search?q=[encoded song title]`
- **Bandcamp**: `https://bandcamp.com/search?q=[encoded song title]`

**Option 2: Direct song URLs (Best UX)**

- Requires manual collection or scraping of actual track URLs
- Could use browser automation (Playwright) to scrape from album pages:
    - <https://open.spotify.com/album/7F8SZFUH9ixWb36X3ibVSF>
    - <https://music.apple.com/us/album/deck-diamonds/1800133020>
    - <https://hallelujahthehills.bandcamp.com/album/deck-diamonds>
    - <https://music.youtube.com/playlist?list=OLAK5uy_nnEnRKPIMqH6hBNKETC7Pcyuu_-97GGFs>

**Option 3: Platform APIs**

- **Spotify**: OAuth required, good search/playlist capabilities
- **Apple Music**: Requires paid developer account ($99/year)
- **YouTube Music**: No dedicated API, complex workarounds
- **Bandcamp**: No official API available

### Recommended implementation approach

1. **Phase 1**: Build app without streaming integration
2. **Phase 2**: Add search URLs for quick implementation
3. **Phase 3**: Upgrade to direct URLs via manual collection or scraping
4. **Phase 4**: Consider API integration for advanced features (playlist creation)

### Data structure preparation

When streaming integration is added, the embedded data structure can be expanded:

```javascript
const DECK = {
  "AD": {
    "song": "Gimme Midnight (Ace of Diamonds)",
    "urls": {
      "spotify": "https://open.spotify.com/track/[id]",
      "apple": "https://music.apple.com/song/[id]",
      "youtube": "https://music.youtube.com/watch?v=[id]",
      "bandcamp": "https://hallelujahthehills.bandcamp.com/track/[slug]"
    }
  }
  // ... rest of cards
}
```

## User experience flow

1. **Initial state**: Face-down deck, empty card list, empty pull menu
2. **Drawing cards**: Click deck → card reveals → added to list → streaming links appear
3. **Building playlist**: Continue drawing up to 13 cards, each with individual streaming access
4. **Completing pull**: At 13 cards, deck disables, "New pull" button appears
5. **Managing pulls**: Access previous pulls via menu, share via URL
6. **Starting over**: "New pull" button resets state, enables deck

## Design considerations

### Visual style

- Match hallelujahthehills.com aesthetic
- Clean, music-focused design
- Emphasize card artwork prominently
- Readable typography for song titles

### Responsive behavior

- Mobile: Stack all elements vertically
- Tablet/Desktop: Deck on side, card list takes main content area
- Maintain usability across all screen sizes

### Performance

- Lazy load card images as they're drawn
- Minimal bundle size with embedded data
- Fast static hosting deployment

## Development priorities

### Phase 1 (MVP)

- Basic card drawing functionality
- Vertical list display
- URL parameter handling
- Simple streaming links

### Phase 2 (Enhanced)

- Pull saving/loading
- Previous pulls menu
- Improved responsive design
- Better streaming service integration

### Phase 3 (Polish)

- Animations and transitions
- Enhanced mobile experience
- Social sharing features
- Analytics (if desired)

## Testing considerations

- Test with all 54 cards
- Verify no duplicates possible
- Test URL sharing across devices
- Validate streaming links work correctly
- Mobile responsiveness testing
- localStorage persistence testing
