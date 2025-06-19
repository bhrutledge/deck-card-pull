import { test, expect } from '@playwright/test';

test.describe('Card Drawing - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the homepage with deck ready to draw', async ({ page }) => {
    // Verify page loads correctly
    await expect(page).toHaveTitle(/The DECK deck/);
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

  test('can draw multiple cards in sequence', async ({ page }) => {
    // Draw 3 cards
    for (let i = 1; i <= 3; i++) {
      await page.locator('.deck').click();

      // Verify correct number of cards
      await expect(page.locator('.card-grid-item')).toHaveCount(i);

      // Verify the latest card has correct number
      const latestCard = page.locator('.card-grid-item').nth(i - 1);
      await expect(latestCard.locator('.card-number')).toContainText(i.toString());
    }

    // Verify deck is still enabled (not at limit)
    const deck = page.locator('.deck');
    await expect(deck).not.toHaveClass('disabled');
  });

  test('enforces maximum card limit (13 cards)', async ({ page }) => {
    // Draw 13 cards (the maximum)
    for (let i = 1; i <= 13; i++) {
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(i);
    }

    // Verify deck becomes disabled at 13 cards
    const deck = page.locator('.deck');
    await expect(deck).toHaveClass(/disabled/);

    // Try to click disabled deck - should not add more cards
    await deck.click();
    await expect(page.locator('.card-grid-item')).toHaveCount(13);
  });

  test('prevents duplicate cards', async ({ page }) => {
    // Draw several cards
    for (let i = 0; i < 5; i++) {
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(i + 1);
    }

    // Wait for URL to update after all draws
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    // Get all drawn cards from URL and verify no duplicates
    const url = await page.url();
    const urlParams = new URL(url).searchParams;
    const cardsParam = urlParams.get('cards');

    if (cardsParam) {
      // Use the same parsing logic as the app
      const cardCodes = await page.evaluate((cardsString) => {
        const cardCodes = [];
        let i = 0;
        while (i < cardsString.length) {
          // Try 3-character code first (for 10s)
          if (i + 2 < cardsString.length) {
            const code3 = cardsString.substring(i, i + 3);
            // Check if it's a valid 10 card (starts with 10)
            if (code3.startsWith('10')) {
              cardCodes.push(code3);
              i += 3;
              continue;
            }
          }
          // Try 2-character code
          if (i + 1 < cardsString.length) {
            const code2 = cardsString.substring(i, i + 2);
            cardCodes.push(code2);
            i += 2;
          } else {
            i++;
          }
        }
        return cardCodes;
      }, cardsParam);

      // Verify no duplicates within the current set
      const uniqueCards = new Set(cardCodes);
      expect(uniqueCards.size).toBe(cardCodes.length);
      expect(cardCodes.length).toBe(5); // Should have all 5 cards
    }

    // Also verify by checking the actual card elements for uniqueness
    const cardElements = page.locator('.card-grid-item img');
    const cardSrcs = await cardElements.evaluateAll(imgs =>
      imgs.map(img => img.getAttribute('src'))
    );
    const uniqueSrcs = new Set(cardSrcs);
    expect(uniqueSrcs.size).toBe(cardSrcs.length);
  });

  test('scrolls to newly drawn cards', async ({ page }) => {
    // Draw first card
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Draw several more cards to trigger scrolling
    for (let i = 2; i <= 5; i++) {
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(i);

      // Verify the latest card is in viewport
      const latestCard = page.locator('.card-grid-item').nth(i - 1);
      await expect(latestCard).toBeInViewport();
    }
  });

  test('new pull button resets the deck', async ({ page }) => {
    // Draw some cards
    await page.locator('.deck').click();
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(2);

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

    // Verify deck is enabled again
    const deck = page.locator('.deck');
    await expect(deck).not.toHaveClass('disabled');
  });

  test('maintains card order consistently', async ({ page }) => {
    // Draw 4 cards
    for (let i = 1; i <= 4; i++) {
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(i);
    }

    // Verify cards are numbered sequentially
    for (let i = 1; i <= 4; i++) {
      const card = page.locator('.card-grid-item').nth(i - 1);
      await expect(card.locator('.card-number')).toContainText(i.toString());
    }

    // Wait for URL to update (throttled at 300ms)
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    // Verify order remains consistent after page operations
    await page.reload();

    // Cards should reload from URL in same order
    await expect(page.locator('.card-grid-item')).toHaveCount(4);
    for (let i = 1; i <= 4; i++) {
      const card = page.locator('.card-grid-item').nth(i - 1);
      await expect(card.locator('.card-number')).toContainText(i.toString());
    }
  });
});
