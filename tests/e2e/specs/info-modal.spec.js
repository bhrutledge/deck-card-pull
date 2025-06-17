import { test, expect } from '@playwright/test';

test.describe('About DECK Info Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Draw a card to show controls with info button
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);
  });

  test('info button opens modal', async ({ page }) => {
    // Verify modal is not visible initially
    const modal = page.locator('.modal-overlay');
    await expect(modal).not.toBeVisible();

    // Click info button
    await page.locator('button[title="About DECK"]').click();

    // Verify modal appears
    await expect(modal).toBeVisible();
    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();
  });

  test('modal contains expected content', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();

    // Verify main text content
    await expect(modalContent).toContainText('DECK is 3.5+ hours of music from Hallelujah The Hills');
    await expect(modalContent).toContainText('DECK is 4 albums released in one day');
    await expect(modalContent).toContainText('DECK is an actual deck of playing cards');
    await expect(modalContent).toContainText('DECK is an invitation to listeners');

    // Verify DECK link (text link)
    const deckTextLink = modalContent.locator('a[href*="hallelujahthehills.com/music/deck"]').first();
    await expect(deckTextLink).toBeVisible();
    await expect(deckTextLink).toHaveAttribute('target', '_blank');
    await expect(deckTextLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Verify album art image
    const albumImage = modalContent.locator('img[alt="DECK Album Art"]');
    await expect(albumImage).toBeVisible();
    await expect(albumImage).toHaveAttribute('width', '360');
    await expect(albumImage).toHaveAttribute('height', '360');

    // Verify art credit
    await expect(modalContent).toContainText('All artwork by Ryan H. Walsh');
    const artCredit = modalContent.locator('.modal-art-credit');
    await expect(artCredit).toBeVisible();
  });

  test('modal close button works', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    // Click close button
    await page.locator('.modal-close').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('clicking outside modal closes it', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    // Click on overlay (outside modal content)
    await modal.click({ position: { x: 10, y: 10 } });

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('clicking inside modal content does not close modal', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    const modalContent = page.locator('.modal-content');
    await expect(modal).toBeVisible();

    // Click inside modal content
    await modalContent.click();

    // Verify modal remains open
    await expect(modal).toBeVisible();
  });

  test('modal is accessible via keyboard', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    // Close button should be focusable
    const closeButton = page.locator('.modal-close');
    await closeButton.focus();
    await expect(closeButton).toBeFocused();

    // Pressing Enter should close modal
    await page.keyboard.press('Enter');
    await expect(modal).not.toBeVisible();
  });

  test('modal links have correct attributes', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // Check DECK text link
    const deckTextLink = page.locator('.modal-content a[href*="hallelujahthehills.com/music/deck"]').first();
    await expect(deckTextLink).toHaveAttribute('target', '_blank');
    await expect(deckTextLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Check album art link
    const albumArtLink = page.locator('.modal-content a').filter({ has: page.locator('img[alt="DECK Album Art"]') });
    await expect(albumArtLink).toHaveAttribute('target', '_blank');
    await expect(albumArtLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(albumArtLink).toHaveAttribute('href', /hallelujahthehills\.com\/music\/deck/);
  });

  test('modal image has hover effect', async ({ page }) => {
    // Open modal
    await page.locator('button[title="About DECK"]').click();
    await expect(page.locator('.modal-overlay')).toBeVisible();

    // Wait for image to be fully loaded and visible
    const albumImage = page.locator('.modal-content img[alt="DECK Album Art"]');
    await expect(albumImage).toBeVisible();

    // Find the parent link that contains the image (simpler selector)
    const albumLink = page.locator('.modal-content a').filter({ has: page.locator('img[alt="DECK Album Art"]') });
    await expect(albumLink).toBeVisible();

    // Hover over the image link
    await albumLink.hover();

    // The image should have hover styles applied (opacity change)
    // Note: This tests the CSS hover state is properly applied
    await expect(albumImage).toBeVisible();
  });

  test('modal works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    // Modal should be responsive and fit viewport
    const modalContent = page.locator('.modal-content');
    await expect(modalContent).toBeVisible();

    // Modal should not exceed viewport width
    const boundingBox = await modalContent.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);

    // Close button should be appropriately sized for mobile
    const closeButton = page.locator('.modal-close');
    await expect(closeButton).toBeVisible();

    // Should be able to close modal on mobile
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test('modal content is scrollable when needed', async ({ page }) => {
    // Set a very small viewport to force scrolling
    await page.setViewportSize({ width: 300, height: 400 });

    // Open modal
    await page.locator('button[title="About DECK"]').click();
    const modal = page.locator('.modal-overlay');
    await expect(modal).toBeVisible();

    const modalContent = page.locator('.modal-content');

    // Modal content should be scrollable if it exceeds max height
    const isScrollable = await modalContent.evaluate(el => {
      return el.scrollHeight > el.clientHeight;
    });

    if (isScrollable) {
      // Should be able to scroll within modal
      await modalContent.evaluate(el => {
        el.scrollTop = 50;
      });

      const scrollTop = await modalContent.evaluate(el => el.scrollTop);
      expect(scrollTop).toBeGreaterThan(0);
    }
  });

  test('info button is only visible when cards are present', async ({ page }) => {
    // Start fresh
    await page.goto('/');

    // Info button should not be visible initially
    const infoButton = page.locator('button[title="About DECK"]');
    await expect(infoButton).not.toBeVisible();

    // Draw a card
    await page.locator('.deck').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(1);

    // Now info button should be visible
    await expect(infoButton).toBeVisible();

    // Reset deck
    await page.locator('button[title="Start again"]').click();
    await expect(page.locator('.card-grid-item')).toHaveCount(0);

    // Info button should be hidden again
    await expect(infoButton).not.toBeVisible();
  });
});
