import { test, expect } from '@playwright/test';

test('Meraki Integration UI Verification', async ({ page }) => {
    // Navigate directly to the app
    await page.goto('http://localhost:5173');

    // Wait for loading to finish and champions to appear
    await page.waitForSelector('.champ-card');

    // Find Volibear
    await page.fill('input[placeholder="Search champions..."]', 'Volibear');
    await page.click('.champ-card:has-text("Volibear")');

    // Let skills render
    await page.waitForSelector('.ability-card');

    // Wait a bit for animations
    await page.waitForTimeout(2000);

    // Take screenshot of base Meraki abilities
    await page.screenshot({ path: '/tmp/meraki_volibear_base.png', fullPage: true });

    // Equip Heartsteel (800 HP) and Riftmaker (350 HP, 80 AP) to see scaling
    await page.fill('input[placeholder="Search items..."]', 'Heartsteel');
    await page.waitForSelector('.catalog-item img[alt="Heartsteel"]');
    await page.click('.catalog-item img[alt="Heartsteel"]');

    await page.fill('input[placeholder="Search items..."]', 'Riftmaker');
    await page.waitForSelector('.catalog-item img[alt="Riftmaker"]');
    await page.click('.catalog-item img[alt="Riftmaker"]');

    // Let math update
    await page.waitForTimeout(1000);

    // Level up W and E
    await page.click('.skill-letter.w + .rank-controls button:nth-child(3)');
    await page.click('.skill-letter.w + .rank-controls button:nth-child(3)');

    await page.click('.skill-letter.e + .rank-controls button:nth-child(3)');

    // Level up champion to 11
    await page.fill('input[type="range"]', '11');

    // Take screenshot of scaled Meraki abilities
    await page.screenshot({ path: '/tmp/meraki_volibear_scaled.png', fullPage: true });

    console.log("Meraki test complete! Screenshots saved to /tmp/");
});
