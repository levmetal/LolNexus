import { test, expect } from '@playwright/test';

test('Capture Console Logs', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`BROWSER ERROR: ${error.message}`));

    await page.goto('http://localhost:5173');

    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/debug_error.png' });
});
