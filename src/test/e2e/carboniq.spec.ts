import { test, expect } from '@playwright/test';

test.describe('CarbonIQ Full End-to-End User Journeys', () => {

  test.beforeEach(async ({ page }) => {
    // Open the primary application playground console
    await page.goto('/');
  });

  test('should load the dashboard and display default workspace telemetry details', async ({ page }) => {
    // Confirm page title / brand logo is visible
    await expect(page.locator('text=CarbonIQ')).toHaveCount(1);
    
    // Verify system nodes and default calculation frames
    await expect(page.locator('text=Invoice Capture Frame')).toBeVisible();
    await expect(page.locator('text=Playground Engine')).toBeVisible();
  });

  test('should successfully ingest and run Bengaluru Cafe receipt sample analysis', async ({ page }) => {
    // Click on the Bengaluru sample ingestion button
    await page.click('#demo-btn-bengaluru');

    // System transitions through OCR, Mapping, Recalculations telemetry phases
    // We expect the scan result to reload dynamically
    await expect(page.locator('text=Sourdough Bread Toast')).toBeVisible();
    await expect(page.locator('text=Classic Paneer Tikka Tikka')).toBeVisible();

    // Check carbon scoreboard values
    await expect(page.locator('text=3.8kg')).toBeVisible();
  });

  test('should successfully trigger Mumbai Mart premium ghee-load sample and inspect swaps', async ({ page }) => {
    await page.click('#demo-btn-mumbai');

    // Confirm total co2 score is updated to reflect Mumbai Mart
    await expect(page.locator('text=11.2kg')).toBeVisible();
    await expect(page.locator('text=Pure Cow Ghee')).toBeVisible();

    // The recommendation cards highlight alternative items
    await expect(page.locator('text=Cold-Pressed Mustard Oil')).toBeVisible();
  });

  test('should navigate to digital Carbon Twin simulation workspace and slide parameters', async ({ page }) => {
    // Transition viewport to the Twin layout panel
    await page.click('button:has-text("Carbon Twin AI")');

    // Verify simulation deck is active
    await expect(page.locator('text=Active Simulation Parameters')).toBeVisible();
    await expect(page.locator('text=Personal Carbon Projection')).toBeVisible();

    // Slide dairy reduction slider from default values to 80%
    const slider = page.locator('input[aria-label="Dairy Reduction Slide Scale"]');
    if (await slider.count() > 0) {
      await slider.fill('80');
      // Projections should reactively scale down
      await expect(page.locator('text=Saving')).toBeVisible();
    }
  });

  test('should navigate to AI Coach Advisor and exchange sustainability chat suggestions', async ({ page }) => {
    // Transition to chatbot channel
    await page.click('button:has-text("AI Advisor Coach")');

    await expect(page.locator('text=AI Carbon Coach Stream')).toBeVisible();

    // Enter a custom query into messenger frame
    const inputField = page.locator('input[placeholder="Ask Coach about carbon indices..."]');
    await inputField.fill('What should I replace first?');
    await page.click('button:has-text("Stream query")');

    // Verify conversation bubble propagates and responds containing custom memory matches
    await expect(page.locator('text=What should I replace first?')).toBeVisible();
    await expect(page.locator('text=Cow Ghee')).toBeVisible();
  });

  test('should navigate to municipal node dashboard and compare community benchmark analytics', async ({ page }) => {
    // Enter Municipal network tab
    await page.click('button:has-text("Municipal Network")');

    await expect(page.locator('text=Municipal Climate Nodes Network')).toBeVisible();

    // Check regional data rankings of Pune, Mumbai, Bengaluru
    await expect(page.locator('text=Pune Node')).toBeVisible();
    await expect(page.locator('text=Mumbai Node')).toBeVisible();
    await expect(page.locator('text=Bengaluru Node')).toBeVisible();
  });

  test('should join weekly eco action campaigns and lock in carbon-saving commitments', async ({ page }) => {
    // Open action campaigns panel
    await page.click('button:has-text("Action Campaigns")');

    await expect(page.locator('text=Low Carbon Action Campaigns')).toBeVisible();

    // Commit to a campaign and verify rewards points additions
    const commitButtons = page.locator('button:has-text("COMMIT")');
    if (await commitButtons.count() > 0) {
      await commitButtons.first().click();
      // Should show local success notifications and update commitment state
      await expect(page.locator('text=ACTIVE COMMIT')).toBeVisible();
    }
  });

});
