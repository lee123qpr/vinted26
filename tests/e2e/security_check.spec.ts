
import { test, expect } from '@playwright/test';

test.describe('Security Audit', () => {

    test('Unauthenticated Access Control', async ({ page }) => {
        const protectedRoutes = ['/sell', '/dashboard', '/messages', '/admin'];
        for (const route of protectedRoutes) {
            await page.goto(`http://localhost:3000${route}`);
            await expect(page).toHaveURL(/.*(auth|login|auth\/signin).*/); // Expect redirect to login
        }
    });

    test('Privilege Escalation Prevention', async ({ page }) => {
        // 1. Register/Login as Normal User
        await page.goto('http://localhost:3000/auth/signup');
        // Use verified selectors
        await page.getByLabel('Full Name *').fill('Regular User');
        await page.getByLabel('Username *').fill(`user_${Date.now()}`);
        await page.getByLabel('Email address *').fill(`user_${Date.now()}@test.com`);
        await page.getByLabel('Password *', { exact: true }).fill('Password123!');
        await page.getByLabel('Confirm Password *').fill('Password123!');
        await page.click('button:has-text("Create Account")');
        await expect(page).toHaveURL(/dashboard/);

        // 2. Try to access Admin
        await page.goto('http://localhost:3000/admin');
        // Expect redirect to Home ('/') as per middleware
        await expect(page).toHaveURL('http://localhost:3000/');
        // Verify not seeing Admin Dashboard
        await expect(page.locator('h1')).not.toContainText('Platform Overview');
    });

    test('XSS Prevention in Listing', async ({ page }) => {
        // 1. Authenticate (Reuse or clean state? New user safer)
        await page.goto('http://localhost:3000/auth/signup');
        await page.getByLabel('Full Name *').fill('XSS Tester');
        await page.getByLabel('Username *').fill(`xss_${Date.now()}`);
        await page.getByLabel('Email address *').fill(`xss_${Date.now()}@test.com`);
        await page.getByLabel('Password *', { exact: true }).fill('Password123!');
        await page.getByLabel('Confirm Password *').fill('Password123!');
        await page.click('button:has-text("Create Account")');
        await expect(page).toHaveURL(/dashboard/);

        // 2. Create Listing with Payload
        await page.goto('http://localhost:3000/sell');
        const payload = '<img src=x onerror=alert(1)>';
        await page.fill('input[placeholder*="Title"]', payload);
        await page.fill('textarea[placeholder*="Describe"]', payload);

        // Fill rest...
        await page.locator('select').first().selectOption({ index: 1 });
        await page.locator('//label[contains(text(), "Condition")]/..//select').selectOption({ index: 1 });
        await page.fill('input[placeholder="0.00"]', '10.00');
        await page.fill('input[type="number"][min="1"]', '1');
        await page.fill('input[placeholder="L"]', '10');
        await page.fill('input[placeholder="W"]', '10');
        await page.fill('input[placeholder*="H"]', '10');
        await page.fill('input[placeholder*="Postcode"]', 'SW1A 1AA');
        await page.locator('input[placeholder*="Postcode"]').blur();
        await page.waitForTimeout(2000);

        await page.click('button:has-text("Publish Listing")');
        await expect(page).toHaveURL(/\/listing\//);

        // 3. Verify Payload is Escaped
        // Playwright's locator().textContent() returns the raw text, ensuring it's not HTML.
        // We check if the ALERT actually popped up? Playwright auto-dismisses dialogs.
        // We can listen for dialog.

        // This part is checking if text is rendered literally.
        const title = await page.locator('h1').textContent();
        expect(title).toBe(payload); // Should match literally, meaning it was treated as text, not HTML.

        // To be sure, check if an img tag exists inside h1
        const imgInH1 = await page.locator('h1 img').count();
        expect(imgInH1).toBe(0);
    });

});
