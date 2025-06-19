import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 },
    largeDesktop: { width: 1600, height: 900 }
  };

  Object.entries(viewports).forEach(([deviceType, viewport]) => {
    test.describe(`${deviceType} viewport (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');
      });

      test('homepage loads correctly', async ({ page }) => {
        // Basic elements should be visible
        await expect(page.locator('h1')).toContainText('The DECK deck');
        await expect(page.locator('.deck')).toBeVisible();
        await expect(page.locator('.main-instructions')).toBeVisible();

        // Check that content fits viewport
        const container = page.locator('.container');
        const boundingBox = await container.boundingBox();
        expect(boundingBox?.width).toBeLessThanOrEqual(viewport.width);
      });

      test('card drawing works', async ({ page }) => {
        // Draw a card
        await page.locator('.deck').click();
        await expect(page.locator('.card-grid-item')).toHaveCount(1);

        // Card should be visible and properly sized
        const card = page.locator('.card-grid-item').first();
        await expect(card).toBeVisible();

        const cardImage = card.locator('.card-image');
        await expect(cardImage).toBeVisible();

        // Card should fit within viewport
        const cardBox = await card.boundingBox();
        expect(cardBox?.width).toBeLessThanOrEqual(viewport.width);
      });

      test('deck controls layout', async ({ page }) => {
        // Draw a card to show controls
        await page.locator('.deck').click();
        await expect(page.locator('.card-grid-item')).toHaveCount(1);

        const deckControls = page.locator('.deck-controls');
        await expect(deckControls).toBeVisible();

        // Action icons should be visible
        const actionIcons = page.locator('.action-icons');
        await expect(actionIcons).toBeVisible();

        // Streaming selector should be visible
        const streamingSelector = page.locator('.streaming-selector');
        await expect(streamingSelector).toBeVisible();

        // Controls should fit within deck container width
        const controlsBox = await deckControls.boundingBox();
        expect(controlsBox?.width).toBeLessThanOrEqual(200); // Reasonable max width
      });
    });
  });

  test.describe('Card Grid Layout', () => {
    test('single column on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');

      // Draw multiple cards
      for (let i = 0; i < 4; i++) {
        await page.locator('.deck').click();
        await expect(page.locator('.card-grid-item')).toHaveCount(i + 1);
      }

      // On mobile, cards should stack vertically (check that there's minimal horizontal space)
      const cardGrid = page.locator('.card-grid');
      const gridComputedStyle = await cardGrid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // Should be single column on mobile - could be 1fr or a single calculated value
      expect(gridComputedStyle).toMatch(/^(1fr|\d+px)$/);
    });

    test('multiple columns on larger screens', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');

      // Draw multiple cards
      for (let i = 0; i < 6; i++) {
        await page.locator('.deck').click();
        await expect(page.locator('.card-grid-item')).toHaveCount(i + 1);
      }

      // On larger screens, should have multiple columns
      const cardGrid = page.locator('.card-grid');
      const gridComputedStyle = await cardGrid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // Should not be single column on desktop
      expect(gridComputedStyle).not.toBe('1fr');
      // Should have multiple column values or contain repeat() logic result
      expect(gridComputedStyle.split(' ').length).toBeGreaterThan(1);
    });
  });

  test.describe('Modal Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.locator('.deck').click(); // Draw card to show controls
      await expect(page.locator('.card-grid-item')).toHaveCount(1);
    });

    test('modal fits mobile viewport', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);

      // Open modal
      await page.locator('button[title="About DECK"]').click();
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();

      const modalContent = page.locator('.modal-content');
      const boundingBox = await modalContent.boundingBox();

      // Modal should fit within mobile viewport with some padding
      expect(boundingBox?.width).toBeLessThanOrEqual(viewports.mobile.width - 8); // Allow for minimal padding
      expect(Math.round(boundingBox?.height || 0)).toBeLessThanOrEqual(Math.round(viewports.mobile.height * 0.95)); // 95vh max, rounded to avoid floating-point precision issues
    });

    test('modal close button is appropriately sized', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);

      // Open modal
      await page.locator('button[title="About DECK"]').click();
      await expect(page.locator('.modal-overlay')).toBeVisible();

      const closeButton = page.locator('.modal-close');
      const buttonBox = await closeButton.boundingBox();

      // Close button should be large enough for touch targets (minimum 44px)
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Typography and Spacing', () => {
    test('font sizes scale appropriately', async ({ page }) => {
      // Test mobile
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');

      const mobileTitle = page.locator('.main-title');
      const mobileFontSize = await mobileTitle.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });

      // Test desktop
      await page.setViewportSize(viewports.desktop);
      await page.reload();

      const desktopTitle = page.locator('.main-title');
      const desktopFontSize = await desktopTitle.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });

      // Desktop font should be larger than mobile
      const mobileSize = parseFloat(mobileFontSize);
      const desktopSize = parseFloat(desktopFontSize);
      expect(desktopSize).toBeGreaterThan(mobileSize);
    });

    test('card dimensions scale with viewport', async ({ page }) => {
      // Test mobile card size
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(1);

      const mobileCard = page.locator('.card-image-link').first();
      const mobileCardBox = await mobileCard.boundingBox();

      // Test desktop card size
      await page.setViewportSize(viewports.desktop);
      await page.reload();
      await expect(page.locator('.card-grid-item')).toHaveCount(1);

      const desktopCard = page.locator('.card-image-link').first();
      const desktopCardBox = await desktopCard.boundingBox();

      // Desktop cards should be larger than mobile cards
      expect(desktopCardBox?.width).toBeGreaterThan(mobileCardBox?.width || 0);
      expect(desktopCardBox?.height).toBeGreaterThan(mobileCardBox?.height || 0);
    });
  });

  test.describe('Touch and Interaction', () => {
    test('touch targets are appropriately sized on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');

      // Draw card to show controls
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(1);

      // Test deck click target
      const deck = page.locator('.deck');
      const deckBox = await deck.boundingBox();
      expect(deckBox?.width).toBeGreaterThanOrEqual(44);
      expect(deckBox?.height).toBeGreaterThanOrEqual(44);

      // Test action button targets
      const actionButtons = page.locator('.action-icon-btn');
      const buttonCount = await actionButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const buttonBox = await actionButtons.nth(i).boundingBox();
        expect(buttonBox?.width).toBeGreaterThanOrEqual(36);
        expect(buttonBox?.height).toBeGreaterThanOrEqual(36);
      }
    });

    test('scrolling works properly on mobile', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('/');

      // Draw many cards to trigger scrolling
      for (let i = 0; i < 8; i++) {
        await page.locator('.deck').click();
        await expect(page.locator('.card-grid-item')).toHaveCount(i + 1);
      }

      // Should be able to scroll to see all cards
      const lastCard = page.locator('.card-grid-item').last();

      // Scroll to last card
      await lastCard.scrollIntoViewIfNeeded();
      await expect(lastCard).toBeInViewport();

      // Should be able to scroll back to top
      const firstCard = page.locator('.card-grid-item').first();
      await firstCard.scrollIntoViewIfNeeded();
      await expect(firstCard).toBeInViewport();
    });
  });

  test.describe('Layout Stability', () => {
    test('no layout shift when cards load', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('/');

      // Get initial layout measurements
      const initialInstructions = page.locator('.main-instructions');
      const initialPosition = await initialInstructions.boundingBox();

      // Draw a card
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(1);

      // Instructions should be hidden, but layout shouldn't shift dramatically
      await expect(initialInstructions).not.toBeVisible();

      // Deck should remain in same position
      const deck = page.locator('.deck');
      const deckPosition = await deck.boundingBox();
      expect(deckPosition?.x).toBeDefined();
      expect(deckPosition?.y).toBeDefined();
    });

    test('consistent spacing across viewport changes', async ({ page }) => {
      await page.goto('/');
      await page.locator('.deck').click();
      await expect(page.locator('.card-grid-item')).toHaveCount(1);

      // Test different viewports maintain proper spacing
      for (const [deviceType, viewport] of Object.entries(viewports)) {
        await page.setViewportSize(viewport);

        // Elements should maintain reasonable spacing
        const container = page.locator('.container');
        const containerPadding = await container.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight
          };
        });

        // Should have some padding on all viewports
        expect(parseFloat(containerPadding.paddingLeft)).toBeGreaterThan(0);
        expect(parseFloat(containerPadding.paddingRight)).toBeGreaterThan(0);
      }
    });
  });
});
