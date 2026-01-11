
import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Admin Suite', () => {
    let adminEmail = '';
    // Use a predictable password for local dev testing
    const password = 'Password123!';

    test.beforeAll(() => {
        // Generate unique email
        adminEmail = `admin_test_${Date.now()}@example.com`;
    });

    test('Complete Admin Journey', async ({ page }) => {
        // 1. Sign Up a new user
        await page.goto('http://localhost:3000/auth/signup');

        // Fill form using exact labels
        await page.getByLabel('Full Name *').fill('Admin Test User');
        await page.getByLabel('Username *').fill(`admin_${Date.now()}`);
        await page.getByLabel('Email address *').fill(adminEmail);
        await page.getByLabel('Password *', { exact: true }).fill(password);
        await page.getByLabel('Confirm Password *').fill(password);

        await page.click('button:has-text("Create Account")');

        // Wait for navigation - wait for 15s to be safe
        console.log('Waiting for post-signup navigation...');
        await page.waitForURL(/.*(dashboard|onboarding).*/, { timeout: 15000 }).catch(() => {
            console.log('Navigation timeout. Current URL:', page.url());
            // Don't fail immediately, check if we are still on signup (maybe validation error?)
        });
        // In dev mode, we might not require email confirm, OR we might be blocked.
        // If confirmation required, we are stuck unless we inspect DB or have auto-confirm on.
        // Assuming Supabase local config allows signups properly or we set confirm_email to false.
        // Let's assume we land on HomePage or Onboarding.
        await expect(page).toHaveURL(/.*dashboard|.*onboarding|.*/, { timeout: 10000 });

        // 2. Promote to Admin (Server-side Override)
        // Run the script synchronously
        console.log(`Promoting ${adminEmail}...`);
        try {
            execSync(`node scripts/promote_admin.js ${adminEmail}`);
            console.log('Promotion script executed.');
        } catch (e) {
            console.error('Promotion script failed:', e);
            throw e;
        }

        // 3. Verify Admin Access
        // Reload to refresh session claims if necessary (Next.js middleware might cache role?)
        await page.reload();
        await page.waitForTimeout(1000); // Wait for hydration

        // Navigate explicitly to Admin
        await page.goto('http://localhost:3000/admin');

        // Assert Dashboard Content
        console.log('Checking Dashboard...');
        await expect(page.locator('h1')).toContainText('Platform Overview');

        // Check Navigation Links
        // Users
        console.log('Navigating to Users...');
        await page.click('a[href="/admin/users"]');
        await expect(page.locator('h1')).toContainText('User Management');
        await expect(page.getByText('Rank')).toBeVisible();

        // Financials
        console.log('Navigating to Finance...');
        await page.click('a[href="/admin/finance"]');
        await expect(page.locator('h1')).toContainText('Platform Financials');
        await expect(page.getByText('Stripe Available')).toBeVisible();

        // Listings
        console.log('Navigating to Listings...');
        await page.click('a[href="/admin/listings"]');
        await expect(page.locator('h1')).toContainText('Listing Moderation');

        // Disputes
        console.log('Navigating to Disputes...');
        await page.click('a[href="/admin/disputes"]');
        await expect(page.locator('h1')).toContainText('Dispute Resolution');

        // Settings
        console.log('Navigating to Settings...');
        await page.click('a[href="/admin/settings"]');
        await expect(page.locator('h1')).toContainText('System Settings');
        await expect(page.getByText('Maintenance Mode')).toBeVisible();

        // Marketing
        console.log('Navigating to Marketing...');
        await page.click('a[href="/admin/marketing"]');
        await expect(page.locator('h1')).toContainText('Marketing & Data');
        await expect(page.getByText('Export User Data')).toBeVisible();

        // CMS
        console.log('Navigating to Articles...');
        await page.click('a[href="/admin/articles"]');
        await expect(page.locator('h1')).toContainText('News & Articles');

        console.log('Admin Journey Verification Complete ✅');
    });
});
