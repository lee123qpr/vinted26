import { test, expect } from '@playwright/test';

test.describe('Admin Features - Complete Test Suite', () => {
    // Login as admin before each test
    test.beforeEach(async ({ page }) => {
        // TODO: Replace with your admin credentials
        await page.goto('http://localhost:3000/auth/login');
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'your-admin-password');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test.describe('1. Dashboard Overview', () => {
        test('should display all 8 metrics', async ({ page }) => {
            await page.goto('http://localhost:3000/admin');

            // Check for metric cards
            await expect(page.getByText('Total Users')).toBeVisible();
            await expect(page.getByText('Active Listings')).toBeVisible();
            await expect(page.getByText('Carbon Saved (kg)')).toBeVisible();
            await expect(page.getByText('Revenue')).toBeVisible();
            await expect(page.getByText('Sold Listings')).toBeVisible();
            await expect(page.getByText('Pending Disputes')).toBeVisible();
            await expect(page.getByText('Flagged Users')).toBeVisible();
            await expect(page.getByText('Materials Diverted (kg)')).toBeVisible();
        });

        test('should display quick action buttons', async ({ page }) => {
            await page.goto('http://localhost:3000/admin');

            await expect(page.getByText('Review Flagged Listings')).toBeVisible();
            await expect(page.getByText('Handle Disputes')).toBeVisible();
            await expect(page.getByText('Verify Accounts')).toBeVisible();
            await expect(page.getByText('View Reports')).toBeVisible();
        });

        test('quick actions should navigate correctly', async ({ page }) => {
            await page.goto('http://localhost:3000/admin');

            await page.getByText('View Reports').click();
            await expect(page).toHaveURL(/.*\/admin\/finance/);
        });
    });

    test.describe('2. User Management', () => {
        test('should display enhanced filters', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/users');

            // Check filter inputs exist
            await expect(page.locator('input[name="q"]')).toBeVisible();
            await expect(page.locator('select[name="status"]')).toBeVisible();
            await expect(page.locator('input[name="date_from"]')).toBeVisible();
            await expect(page.locator('input[name="date_to"]')).toBeVisible();
            await expect(page.locator('input[name="location"]')).toBeVisible();
            await expect(page.locator('input[name="verification_pending"]')).toBeVisible();
        });

        test('should filter users by search', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/users');

            await page.fill('input[name="q"]', 'test');
            await page.click('button[type="submit"]');

            // Wait for results to update
            await page.waitForTimeout(1000);

            // Check results count is displayed
            await expect(page.getByText(/Showing.*users/)).toBeVisible();
        });

        test('should show suspension dropdown', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/users');

            // Find first non-admin user's suspension button
            const suspendButton = page.locator('button[title="Suspend User"]').first();

            if (await suspendButton.isVisible()) {
                await suspendButton.click();

                // Check dropdown menu appears
                await expect(page.getByText('Send Warning')).toBeVisible();
                await expect(page.getByText('Suspend 7 Days')).toBeVisible();
                await expect(page.getByText('Suspend 14 Days')).toBeVisible();
                await expect(page.getByText('Suspend 30 Days')).toBeVisible();
                await expect(page.getByText('Permanent Ban')).toBeVisible();
            }
        });

        test('should display status badges', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/users');

            // Check for status column
            await expect(page.getByText('Status')).toBeVisible();
        });
    });

    test.describe('3. Listing Management', () => {
        test('should display enhanced filters', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/listings');

            await expect(page.locator('input[name="q"]')).toBeVisible();
            await expect(page.locator('select[name="status"]')).toBeVisible();
            await expect(page.locator('input[name="date_from"]')).toBeVisible();
            await expect(page.locator('input[name="date_to"]')).toBeVisible();
            await expect(page.locator('input[name="price_min"]')).toBeVisible();
            await expect(page.locator('input[name="price_max"]')).toBeVisible();
        });

        test('should enable bulk selection', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/listings');

            // Check for select all checkbox
            const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
            await expect(selectAllCheckbox).toBeVisible();

            // Select first listing
            const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
            if (await firstCheckbox.isVisible()) {
                await firstCheckbox.click();

                // Bulk action toolbar should appear
                await expect(page.getByText(/selected/)).toBeVisible();
                await expect(page.getByText('Set Active')).toBeVisible();
                await expect(page.getByText('Archive')).toBeVisible();
                await expect(page.getByText('Delete')).toBeVisible();
            }
        });

        test('should filter by price range', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/listings');

            await page.fill('input[name="price_min"]', '10');
            await page.fill('input[name="price_max"]', '50');
            await page.click('button[type="submit"]');

            await page.waitForTimeout(1000);
            await expect(page.getByText(/Showing.*listings/)).toBeVisible();
        });
    });

    test.describe('4. Dispute Management', () => {
        test('should display dispute list', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/disputes');

            await expect(page.getByText('Dispute Management')).toBeVisible();

            // Check filter tabs
            await expect(page.getByText('All')).toBeVisible();
            await expect(page.getByText('Open')).toBeVisible();
            await expect(page.getByText('Resolved')).toBeVisible();
        });

        test('should filter disputes by status', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/disputes');

            await page.getByText('Open').click();
            await expect(page).toHaveURL(/.*status=open/);

            await page.getByText('Resolved').click();
            await expect(page).toHaveURL(/.*status=resolved/);
        });

        test('should navigate to dispute detail', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/disputes');

            // Click first "View Details" button if it exists
            const viewButton = page.getByText('View Details').first();
            if (await viewButton.isVisible()) {
                await viewButton.click();
                await expect(page).toHaveURL(/.*\/admin\/disputes\/.+/);

                // Check detail page elements
                await expect(page.getByText('Dispute Details')).toBeVisible();
                await expect(page.getByText('Messages')).toBeVisible();
                await expect(page.getByText('Parties')).toBeVisible();
            }
        });
    });

    test.describe('5. Financial Reports', () => {
        test('should display summary cards', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            await expect(page.getByText('Total Revenue')).toBeVisible();
            await expect(page.getByText('Platform Fees')).toBeVisible();
            await expect(page.getByText('Avg Transaction')).toBeVisible();
        });

        test('should display revenue trends', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            await expect(page.getByText('Revenue Trends')).toBeVisible();

            // Check time range selector
            const timeRangeSelect = page.locator('select').first();
            await expect(timeRangeSelect).toBeVisible();

            // Check options
            await expect(timeRangeSelect.locator('option[value="7"]')).toBeVisible();
            await expect(timeRangeSelect.locator('option[value="30"]')).toBeVisible();
            await expect(timeRangeSelect.locator('option[value="90"]')).toBeVisible();
        });

        test('should display category performance', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            await expect(page.getByText('Category Performance')).toBeVisible();
        });

        test('should display top sellers', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            await expect(page.getByText('Top Sellers')).toBeVisible();
        });

        test('should have CSV export button', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            const exportButton = page.getByText('Export to CSV');
            await expect(exportButton).toBeVisible();

            // Note: We don't actually click it to avoid downloading files in tests
        });

        test('should change time range', async ({ page }) => {
            await page.goto('http://localhost:3000/admin/finance');

            const timeRangeSelect = page.locator('select').first();
            await timeRangeSelect.selectOption('90');

            // Wait for data to reload
            await page.waitForTimeout(1500);

            // Revenue trends should still be visible
            await expect(page.getByText('Revenue Trends')).toBeVisible();
        });
    });

    test.describe('6. Navigation & Integration', () => {
        test('should navigate between admin pages', async ({ page }) => {
            await page.goto('http://localhost:3000/admin');

            // Test navigation to each page
            await page.goto('http://localhost:3000/admin/users');
            await expect(page.getByText('User Management')).toBeVisible();

            await page.goto('http://localhost:3000/admin/listings');
            await expect(page.getByText('Listing Moderation')).toBeVisible();

            await page.goto('http://localhost:3000/admin/disputes');
            await expect(page.getByText('Dispute Management')).toBeVisible();

            await page.goto('http://localhost:3000/admin/finance');
            await expect(page.getByText('Financial Reports')).toBeVisible();
        });

        test('quick actions should link correctly', async ({ page }) => {
            await page.goto('http://localhost:3000/admin');

            // Test each quick action link
            const reviewListingsLink = page.getByText('Review Flagged Listings');
            await expect(reviewListingsLink).toHaveAttribute('href', '/admin/listings?status=flagged');

            const handleDisputesLink = page.getByText('Handle Disputes');
            await expect(handleDisputesLink).toHaveAttribute('href', '/admin/disputes?status=open');

            const verifyAccountsLink = page.getByText('Verify Accounts');
            await expect(verifyAccountsLink).toHaveAttribute('href', '/admin/users?verification_pending=true');

            const viewReportsLink = page.getByText('View Reports');
            await expect(viewReportsLink).toHaveAttribute('href', '/admin/finance');
        });
    });
});
