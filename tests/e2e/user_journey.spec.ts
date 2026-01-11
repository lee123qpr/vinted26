
import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Skipped Marketplace User Journey', () => {

    // Hook to capture screenshot on failure
    test.afterEach(async ({ page }, testInfo) => {
        if (testInfo.status !== 'passed') {
            const screenshotPath = `tests/e2e/screenshots/${testInfo.title.replace(/\s+/g, '_')}_failure.png`;
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`Screenshot saved to ${screenshotPath}`);

            const errorLog = `Test failed: ${testInfo.title}\nError: ${testInfo.error?.message}\nStack: ${testInfo.error?.stack}\n`;
            fs.writeFileSync('tests/e2e/error_log.txt', errorLog);
        }
    });

    test('Buyer & Seller Flow: Register, List, Search', async ({ page }) => {
        test.setTimeout(90000);
        try {
            // 1. Register
            console.log('Navigating to Signup...');
            await page.goto('http://localhost:3000/auth/signup');

            // Generate random user
            const uniqueId = Date.now().toString();
            const username = `testuser_${uniqueId}`;
            const email = `test_${uniqueId}@example.com`;
            const password = 'TestPassword123!';

            console.log(`Registering user: ${username}`);
            // Use Label selectors aligned with those verified in admin_suite
            await page.getByLabel('Full Name *').fill('Test User');
            await page.getByLabel('Username *').fill(username);
            await page.getByLabel('Email address *').fill(email);
            // Password might have multiple matches if Confirm Password label contains 'Password'
            await page.getByLabel('Password *', { exact: true }).fill(password);
            await page.getByLabel('Confirm Password *').fill(password);

            await page.click('button:has-text("Create Account")');

            // Wait for Dashboard
            console.log('Waiting for Dashboard...');
            await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

            // 2. Go to Sell Page
            console.log('Navigating to Sell Page...');
            await page.goto('http://localhost:3000/sell');

            // 3. Fill Listing Form
            console.log('Filling Listing Form...');
            await page.fill('input[placeholder*="Title"]', `Test Listing ${uniqueId}`);
            await page.fill('textarea[placeholder*="Describe"]', 'High quality vintage item.');

            // Category (First select)
            const categorySelect = page.locator('select').first();
            await expect(categorySelect).not.toHaveText(/Loading/);
            await categorySelect.selectOption({ index: 1 }); // Select first available category

            // Condition
            // Using XPath for sibling/parent relationship robustness
            await page.locator('//label[contains(text(), "Condition")]/..//select').selectOption({ index: 1 });

            // Price
            await page.fill('input[placeholder="0.00"]', '45.00');

            // Quantity
            await page.fill('input[type="number"][min="1"]', '1');

            // Dimensions/Weight for Carbon
            await page.fill('input[placeholder="L"]', '100');
            await page.fill('input[placeholder="W"]', '100');
            await page.fill('input[placeholder="H"]', '100');

            // Postcode
            await page.fill('input[placeholder*="Postcode"]', 'SW1A 1AA');
            await page.locator('input[placeholder*="Postcode"]').blur();
            await page.waitForTimeout(2000); // Wait for geocode

            // 4. Submit
            console.log('Submitting Listing...');
            await page.click('button:has-text("Publish Listing")');

            // 5. Verify Success
            console.log('Verifying Listing Creation...');
            await expect(page).toHaveURL(/\/listing\//, { timeout: 20000 });
            await expect(page.locator('h1')).toContainText(`Test Listing ${uniqueId}`);

            // Screenshot Listing
            await page.screenshot({ path: 'tests/e2e/screenshots/success_listing.png' });

            // 6. Buyer Flow: Search
            console.log('Navigating to Search...');
            await page.goto('http://localhost:3000/search');

            // FilterSidebar input
            await page.locator('input[placeholder="Search terms..."]').fill(`Test Listing ${uniqueId}`);
            await page.locator('button:has-text("Apply Filters")').click();

            // Verify Results
            console.log('Verifying Search Results...');
            await expect(page.getByText(`Test Listing ${uniqueId}`)).toBeVisible();

            // Screenshot Search
            await page.screenshot({ path: 'tests/e2e/screenshots/success_search.png' });

        } catch (error) {
            console.error('Test Execution Error:', error);
            throw error; // Re-throw to trigger afterEach
        }
    });

});
