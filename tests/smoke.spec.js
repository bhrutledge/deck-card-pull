import { test, expect } from '@playwright/test';

test.describe('DECK App - Smoke Tests', () => {
  test('loads the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/The DECK deck/);

    // Verify main heading is present
    await expect(page.locator('h1')).toContainText('The DECK deck');

    // Verify the deck is visible and clickable
    const deck = page.locator('.deck');
    await expect(deck).toBeVisible();
    await expect(deck).not.toHaveClass('disabled');

    // Verify instructions are shown when no cards are drawn
    const instructions = page.locator('.main-instructions');
    await expect(instructions).toBeVisible();
    await expect(instructions).toContainText('Think of a question');
  });

  test('can draw a single card', async ({ page }) => {
    await page.goto('/');

    // Click the deck to draw a card
    await page.locator('.deck').click();

    // Wait for card to appear
    const cardGrid = page.locator('.card-grid');
    await expect(cardGrid).toBeVisible();

    // Verify one card is displayed
    const cards = page.locator('.card-grid-item');
    await expect(cards).toHaveCount(1);

    // Verify card has proper structure
    const firstCard = cards.first();
    await expect(firstCard.locator('.card-number')).toContainText('1');
    await expect(firstCard.locator('.card-image')).toBeVisible();
    await expect(firstCard.locator('.card-title')).toBeVisible();

    // Verify instructions are hidden when cards are present
    const instructions = page.locator('.main-instructions');
    await expect(instructions).not.toBeVisible();

    // Verify deck controls appear
    const deckControls = page.locator('.deck-controls');
    await expect(deckControls).toBeVisible();
  });

  test('URL updates when card is drawn', async ({ page }) => {
    await page.goto('/');

    // Draw a card
    await page.locator('.deck').click();

    // Wait for card to appear
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Check that URL contains cards parameter
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    const url = page.url();
    expect(url).toContain('cards=');
  });

  test('streaming preference dropdown works', async ({ page }) => {
    await page.goto('/');

    // Draw a card to show controls
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Verify streaming selector is visible
    const streamingSelect = page.locator('#streaming-select');
    await expect(streamingSelect).toBeVisible();

    // Check that it has the expected options
    const options = streamingSelect.locator('option');
    await expect(options).toHaveCount(4);

    // Verify option values
    await expect(options.nth(0)).toHaveText('Apple Music');
    await expect(options.nth(1)).toHaveText('Bandcamp');
    await expect(options.nth(2)).toHaveText('Spotify');
    await expect(options.nth(3)).toHaveText('YouTube Music');

    // Test changing preference
    await streamingSelect.selectOption('spotify');
    await expect(streamingSelect).toHaveValue('spotify');
  });

  test('new pull button resets the deck', async ({ page }) => {
    await page.goto('/');

    // Draw a card
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Click new pull button
    await page.locator('button[title="Start again"]').click();

    // Verify cards are cleared
    await expect(page.locator('.card-grid-item')).toHaveCount(0);

    // Verify instructions are shown again
    const instructions = page.locator('.main-instructions');
    await expect(instructions).toBeVisible();

    // Verify deck controls are hidden
    const deckControls = page.locator('.deck-controls');
    await expect(deckControls).not.toBeVisible();

    // Verify URL is clean
    await page.waitForFunction(() => {
      return !new URL(window.location.href).searchParams.has('cards');
    });
  });
});
