import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Focused User Journey: Signup -> Signin -> List', () => {

    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== 'passed') {
            const screenshotPath = `tests/e2e/screenshots/${testInfo.title.replace(/\s+/g, '_')}_failure.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`Screenshot saved to ${screenshotPath}`);
        }
    });

    test('Complete Verified User Journey', async ({ page }) => {
        // Debug Logging
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        test.setTimeout(120000); // Allow 2 mins for full flow

        // Data Generation
        const uniqueId = Date.now().toString();
        const username = `verify_${uniqueId}`;
        const email = `verify_${uniqueId}@example.com`;
        const password = 'StrongPassword123!';

        // 1. Sign Up
        console.log(`[1/5] Registering new user: ${email}`);
        await page.goto('http://localhost:3000/auth/signup');
        await page.getByLabel('Full Name *').fill('Automation Tester');
        await page.getByLabel('Username *').fill(username);
        await page.getByLabel('Email address *').fill(email);
        await page.getByLabel('Password *', { exact: true }).fill(password);
        await page.getByLabel('Confirm Password *').fill(password);
        await page.click('button:has-text("Create Account")');

        // Verify Dashboard redirect (Auto-login usually happens)
        await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
        console.log('✅ Signup Successful');

        // 2. Sign Out (To verify Sign In works as requested)
        console.log('[2/5] Signing Out...');
        // Locate logout button - assuming standard location in dashboard sidebar or header
        // Using explicit wait to ensure menu is interactive
        await page.click('button:has-text("Sign Out"), a:has-text("Sign Out")');
        await expect(page).toHaveURL(/auth\/signin|auth\/login|^\/$/);
        console.log('✅ Sign Out Successful');

        // 3. Sign In
        console.log('[3/5] Signing In...');
        await page.goto('http://localhost:3000/auth/signin');
        await page.getByLabel('Email address').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.click('button:has-text("Sign in")');

        await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
        console.log('✅ Sign In Successful');

        // 4. Place Listing
        console.log('[4/5] Placing Listing...');
        await page.goto('http://localhost:3000/sell');

        await page.fill('input[placeholder*="Title"]', `Verified Listing ${uniqueId}`);
        await page.fill('textarea[placeholder*="Describe"]', 'This is a verified automated listing.');

        // Form Selectors (Robust)
        const categorySelect = page.locator('select').first();
        await categorySelect.waitFor({ state: 'visible' });
        await categorySelect.selectOption({ index: 1 });

        // Condition
        await page.locator('//label[contains(text(), "Condition")]/..//select').selectOption({ index: 1 });

        // Price & Quantity
        await page.fill('input[placeholder="0.00"]', '99.99');
        await page.fill('input[type="number"][min="1"]', '5');

        // Logistics (Dimensions)
        await page.fill('input[placeholder="L"]', '10');
        await page.fill('input[placeholder="W"]', '10');
        await page.fill('input[placeholder="H"]', '10');

        // Postcode
        await page.fill('input[placeholder*="Postcode"]', 'M1 1AA');
        // Trigger blur to fire geocode
        await page.locator('input[placeholder*="Postcode"]').blur();

        // Wait for potential geocode latency
        await page.waitForTimeout(3000);

        // Submit
        await page.click('button:has-text("Publish Listing")');
        console.log('Listing submitted...');

        // 5. Verification
        console.log('[5/5] Verifying Listings Page...');
        // Should redirect to the new listing or dashboard
        await expect(page).toHaveURL(/\/listing\/|\/dashboard\/listings/, { timeout: 30000 });

        // Check if title exists on page
        await expect(page.getByText(`Verified Listing ${uniqueId}`)).toBeVisible();
        console.log('✅ Listing Verified!');
    });
});
