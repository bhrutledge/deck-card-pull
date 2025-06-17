import { test, expect } from '@playwright/test';

test.describe('URL Sharing & Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('URL updates when cards are drawn', async ({ page }) => {
    // Initial URL should not have cards parameter
    expect(page.url()).not.toContain('cards=');

    // Draw a card
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Check that URL contains cards parameter
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    const url = page.url();
    expect(url).toContain('cards=');
  });

  test('URL updates incrementally as more cards are drawn', async ({ page }) => {
    const cardCounts = [];

    // Draw 3 cards and track URL changes
    for (let i = 1; i <= 3; i++) {
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(i);

      // Wait for URL to update
      await page.waitForFunction((expectedCount) => {
        const url = new URL(window.location.href);
        const cardsParam = url.searchParams.get('cards');
        return cardsParam && cardsParam.length >= expectedCount * 2; // Minimum 2 chars per card
      }, i);

      const url = new URL(page.url());
      const cardsParam = url.searchParams.get('cards');
      cardCounts.push(cardsParam?.length || 0);
    }

    // Verify URL grows with each card (more characters in cards param)
    expect(cardCounts[1]).toBeGreaterThan(cardCounts[0]);
    expect(cardCounts[2]).toBeGreaterThan(cardCounts[1]);
  });

  test('can restore card pull from shared URL', async ({ page }) => {
    // Draw some cards
    await page.locator('.deck').click();
    await page.locator('.deck').click();
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(3);

    // Wait for URL to update (throttled at 300ms)
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    // Get the URL with cards
    const urlWithCards = page.url();
    expect(urlWithCards).toContain('cards=');

    // Navigate to a fresh page
    await page.goto('/');
    await expect(page.locator('.card-grid-item')).toHaveCount(0);

    // Navigate to the URL with cards
    await page.goto(urlWithCards);

    // Verify cards are restored
    await expect(page.locator('.card-grid-item')).toHaveCount(3);

    // Verify cards have proper numbering
    for (let i = 1; i <= 3; i++) {
      const card = page.locator('.card-grid-item').nth(i - 1);
      await expect(card.locator('.card-number')).toContainText(i.toString());
    }

    // Verify UI state is correct
    await expect(page.locator('.main-instructions')).not.toBeVisible();
    await expect(page.locator('.deck-controls')).toBeVisible();
  });

  test('share button copies URL to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Draw a card to show controls
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Wait for URL to update (throttled at 300ms)
    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    // Click share button
    await page.locator('button[title="Copy link to share"]').click();

    // Verify tooltip appears
    const tooltip = page.locator('.copy-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('A link for this draw has been copied');

    // Verify clipboard contains the current URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('cards=');
    expect(clipboardText).toBe(page.url());

    // Verify tooltip disappears after timeout
    await expect(tooltip).not.toBeVisible({ timeout: 4000 });
  });

  test('URL clears when starting new pull', async ({ page }) => {
    // Draw cards and verify URL has cards parameter
    await page.locator('.deck').click();
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(2);

    await page.waitForFunction(() => {
      return new URL(window.location.href).searchParams.has('cards');
    });

    // Start new pull
    await page.locator('button[title="Start again"]').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(0);

    // Verify URL is clean
    await page.waitForFunction(() => {
      return !new URL(window.location.href).searchParams.has('cards');
    });

    expect(page.url()).not.toContain('cards=');
  });

  test('handles invalid URLs gracefully', async ({ page }) => {
    // Test that invalid URLs don't break the app
    await page.goto('/?cards=invalid');

    // Should show clean state (no cards, instructions visible)
    await expect(page.locator('.card-grid-item')).toHaveCount(0);
    await expect(page.locator('.main-instructions')).toBeVisible();

    // App should be functional after invalid URL
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);
  });

  test('handles malformed card codes in URL', async ({ page }) => {
    // Test URL with mix of valid and invalid card codes
    await page.goto('/?cards=ADINVALIDCODE2D');

    // Should only load valid cards and ignore invalid ones
    const cardCount = await page.locator('.card-grid-item').count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
    expect(cardCount).toBeLessThanOrEqual(2); // At most 2 valid cards

    // If any cards loaded, verify they have proper structure
    if (cardCount > 0) {
      const firstCard = page.locator('.card-grid-item').first();
      await expect(firstCard.locator('.card-number')).toBeVisible();
      await expect(firstCard.locator('.card-image')).toBeVisible();
    }
  });

  test('prevents duplicate cards from URL', async ({ page }) => {
    // Create URL with duplicate card codes
    await page.goto('/?cards=ADAD2D2D'); // AD and 2D duplicated

    // Should only show unique cards
    const cardCount = await page.locator('.card-grid-item').count();

    // Count should be 2 or less (depending on how duplicates are handled)
    expect(cardCount).toBeLessThanOrEqual(2);

    // If cards loaded, verify numbering is sequential
    for (let i = 0; i < cardCount; i++) {
      const card = page.locator('.card-grid-item').nth(i);
      await expect(card.locator('.card-number')).toContainText((i + 1).toString());
    }
  });

  test('enforces maximum cards from URL', async ({ page }) => {
    // Create a URL with too many cards (more than 13)
    const manyCards = 'AD2D3D4D5D6D7D8D9D10DJDQDKDAH2H3H4H5H'; // 17 cards
    await page.goto(`/?cards=${manyCards}`);

    // Should enforce maximum limit
    const cardCount = await page.locator('.card-grid-item').count();
    expect(cardCount).toBeLessThanOrEqual(13);

    // URL should be cleaned up if too many cards
    await page.waitForFunction(() => {
      const url = new URL(window.location.href);
      const cardsParam = url.searchParams.get('cards');
      return !cardsParam; // Should remove invalid cards param
    });
  });
});
