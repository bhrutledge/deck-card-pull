import { test, expect } from '@playwright/test';

test.describe('Streaming Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Draw a card to show streaming controls
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);
  });

  test('displays streaming preference dropdown with all options', async ({ page }) => {
    // Verify streaming selector is visible
    const streamingSelect = page.locator('#streaming-select');
    await expect(streamingSelect).toBeVisible();

    // Check that it has the expected options
    const options = streamingSelect.locator('option');
    await expect(options).toHaveCount(4);

    // Verify option text and values
    await expect(options.nth(0)).toHaveText('Apple Music');
    await expect(options.nth(0)).toHaveAttribute('value', 'appleMusic');

    await expect(options.nth(1)).toHaveText('Bandcamp');
    await expect(options.nth(1)).toHaveAttribute('value', 'bandcamp');

    await expect(options.nth(2)).toHaveText('Spotify');
    await expect(options.nth(2)).toHaveAttribute('value', 'spotify');

    await expect(options.nth(3)).toHaveText('YouTube Music');
    await expect(options.nth(3)).toHaveAttribute('value', 'youTubeMusic');
  });

  test('defaults to Bandcamp', async ({ page }) => {
    const streamingSelect = page.locator('#streaming-select');
    await expect(streamingSelect).toHaveValue('bandcamp');
  });

  test('can change streaming preference', async ({ page }) => {
    const streamingSelect = page.locator('#streaming-select');

    // Change to Spotify
    await streamingSelect.selectOption('spotify');
    await expect(streamingSelect).toHaveValue('spotify');

    // Change to Apple Music
    await streamingSelect.selectOption('appleMusic');
    await expect(streamingSelect).toHaveValue('appleMusic');

    // Change to YouTube Music
    await streamingSelect.selectOption('youTubeMusic');
    await expect(streamingSelect).toHaveValue('youTubeMusic');

    // Change back to Bandcamp
    await streamingSelect.selectOption('bandcamp');
    await expect(streamingSelect).toHaveValue('bandcamp');
  });

  test('persists streaming preference in localStorage', async ({ page }) => {
    // Start with fresh page to avoid test contamination
    await page.goto('/');
    await expect(page.locator('.card-grid-item')).toHaveCount(0);
    
    // Draw a card first
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    const streamingSelect = page.locator('#streaming-select');

    // Change preference to Spotify
    await streamingSelect.selectOption('spotify');
    await expect(streamingSelect).toHaveValue('spotify');

    // Reload page
    await page.reload();

    // Wait for card to reload
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Verify preference persisted
    const reloadedSelect = page.locator('#streaming-select');
    await expect(reloadedSelect).toHaveValue('spotify');
  });

  test('persists streaming preference across new pulls', async ({ page }) => {
    const streamingSelect = page.locator('#streaming-select');

    // Change preference to Apple Music
    await streamingSelect.selectOption('appleMusic');
    await expect(streamingSelect).toHaveValue('appleMusic');

    // Start new pull
    await page.locator('button[title="Start again"]').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(0);

    // Draw a new card to show controls again
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Verify preference persisted
    const newSelect = page.locator('#streaming-select');
    await expect(newSelect).toHaveValue('appleMusic');
  });

  test('updates card link titles when preference changes', async ({ page }) => {
    // Get initial card link
    const cardLink = page.locator('.card-image-link').first();

    // Initially should show Bandcamp (default)
    await expect(cardLink).toHaveAttribute('title', /Open on Bandcamp/);

    // Change to Spotify
    const streamingSelect = page.locator('#streaming-select');
    await streamingSelect.selectOption('spotify');

    // Card link title should update
    await expect(cardLink).toHaveAttribute('title', /Open on Spotify/);

    // Change to Apple Music
    await streamingSelect.selectOption('appleMusic');
    await expect(cardLink).toHaveAttribute('title', /Open on Apple Music/);
  });

  test('updates song title link titles when preference changes', async ({ page }) => {
    // Get song title link
    const songLink = page.locator('.song-title-link').first();

    // Initially should show Bandcamp (default)
    await expect(songLink).toHaveAttribute('title', /Open on Bandcamp/);

    // Change to YouTube Music
    const streamingSelect = page.locator('#streaming-select');
    await streamingSelect.selectOption('youTubeMusic');

    // Song link title should update
    await expect(songLink).toHaveAttribute('title', /Open on YouTube Music/);
  });

  test('card links point to correct streaming service', async ({ page }) => {
    const cardLink = page.locator('.card-image-link').first();

    // Test Bandcamp (default)
    let href = await cardLink.getAttribute('href');
    expect(href).toContain('hallelujahthehills.bandcamp.com');

    // Test Spotify
    const streamingSelect = page.locator('#streaming-select');
    await streamingSelect.selectOption('spotify');
    href = await cardLink.getAttribute('href');
    expect(href).toContain('open.spotify.com');

    // Test Apple Music
    await streamingSelect.selectOption('appleMusic');
    href = await cardLink.getAttribute('href');
    expect(href).toContain('music.apple.com');

    // Test YouTube Music
    await streamingSelect.selectOption('youTubeMusic');
    href = await cardLink.getAttribute('href');
    expect(href).toContain('music.youtube.com');
  });

  test('song title links point to correct streaming service', async ({ page }) => {
    const songLink = page.locator('.song-title-link').first();

    // Test Bandcamp (default)
    let href = await songLink.getAttribute('href');
    expect(href).toContain('hallelujahthehills.bandcamp.com');

    // Test Spotify
    const streamingSelect = page.locator('#streaming-select');
    await streamingSelect.selectOption('spotify');
    href = await songLink.getAttribute('href');
    expect(href).toContain('open.spotify.com');

    // Test Apple Music
    await streamingSelect.selectOption('appleMusic');
    href = await songLink.getAttribute('href');
    expect(href).toContain('music.apple.com');

    // Test YouTube Music
    await streamingSelect.selectOption('youTubeMusic');
    href = await songLink.getAttribute('href');
    expect(href).toContain('music.youtube.com');
  });

  test('handles localStorage errors gracefully', async ({ page }) => {
    // Simulate localStorage being unavailable
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('LocalStorage unavailable'); },
          setItem: () => { throw new Error('LocalStorage unavailable'); }
        },
        writable: false
      });
    });

    await page.goto('/');
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Should still work with default preference
    const streamingSelect = page.locator('#streaming-select');
    await expect(streamingSelect).toHaveValue('bandcamp');

    // Should still allow changing preferences (just won't persist)
    await streamingSelect.selectOption('spotify');
    await expect(streamingSelect).toHaveValue('spotify');
  });

  test('streaming preference affects multiple cards', async ({ page }) => {
    // Draw multiple cards
    await page.locator('.deck').click();
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(3); // Total of 3 cards

    // Change to Spotify
    const streamingSelect = page.locator('#streaming-select');
    await streamingSelect.selectOption('spotify');

    // All card links should point to Spotify
    const cardLinks = page.locator('.card-image-link');
    const linkCount = await cardLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const href = await cardLinks.nth(i).getAttribute('href');
      expect(href).toContain('open.spotify.com');
    }

    // All song title links should point to Spotify
    const songLinks = page.locator('.song-title-link');
    const songLinkCount = await songLinks.count();

    for (let i = 0; i < songLinkCount; i++) {
      const href = await songLinks.nth(i).getAttribute('href');
      expect(href).toContain('open.spotify.com');
    }
  });
});
