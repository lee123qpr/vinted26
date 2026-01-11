import { test, expect } from '@playwright/test';

// Helper function to generate unique email
const generateEmail = () => `test${Date.now()}@example.com`;

test.describe('Complete App E2E Tests - All Features', () => {
    let buyerEmail: string;
    let sellerEmail: string;
    let buyerPassword = 'TestPassword123!';
    let sellerPassword = 'TestPassword123!';
    let listingId: string;

    test.describe('1. Authentication Flow', () => {
        test('should sign up a new buyer account', async ({ page }) => {
            buyerEmail = generateEmail();

            await page.goto('http://localhost:3000/auth/signup');

            // Fill signup form
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.fill('input[name="username"]', `buyer_${Date.now()}`);
            await page.fill('input[name="full_name"]', 'Test Buyer');

            await page.click('button[type="submit"]');

            // Should redirect to dashboard or onboarding
            await page.waitForURL(/.*\/(dashboard|onboarding|profile).*/);

            // Verify logged in
            await expect(page.locator('text=Test Buyer')).toBeVisible({ timeout: 10000 });
        });

        test('should sign up a new seller account', async ({ page }) => {
            sellerEmail = generateEmail();

            await page.goto('http://localhost:3000/auth/signup');

            await page.fill('input[name="email"]', sellerEmail);
            await page.fill('input[name="password"]', sellerPassword);
            await page.fill('input[name="username"]', `seller_${Date.now()}`);
            await page.fill('input[name="full_name"]', 'Test Seller');

            await page.click('button[type="submit"]');

            await page.waitForURL(/.*\/(dashboard|onboarding|profile).*/);
            await expect(page.locator('text=Test Seller')).toBeVisible({ timeout: 10000 });
        });

        test('should log out and log back in', async ({ page }) => {
            // Login as buyer
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.waitForURL(/.*dashboard.*/);

            // Logout
            await page.click('button:has-text("Logout"), a:has-text("Logout")');

            // Should redirect to home or login
            await expect(page).toHaveURL(/.*\/(|auth\/login).*/);
        });
    });

    test.describe('2. Listing Creation & Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as seller
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', sellerEmail);
            await page.fill('input[name="password"]', sellerPassword);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard.*/);
        });

        test('should create a new listing', async ({ page }) => {
            await page.goto('http://localhost:3000/sell');

            // Fill listing form
            await page.fill('input[name="title"]', 'Test Vintage T-Shirt');
            await page.fill('textarea[name="description"]', 'A beautiful vintage t-shirt in excellent condition');
            await page.fill('input[name="price"]', '25.00');

            // Select category
            await page.selectOption('select[name="category"]', 'Clothing');

            // Select condition
            await page.selectOption('select[name="condition"]', 'good');

            // Add brand
            await page.fill('input[name="brand"]', 'Vintage Brand');

            // Submit
            await page.click('button[type="submit"]');

            // Should redirect to listing page or dashboard
            await page.waitForURL(/.*\/(listing|dashboard).*/);

            // Verify listing created
            await expect(page.locator('text=Test Vintage T-Shirt')).toBeVisible({ timeout: 10000 });
        });

        test('should view own listings', async ({ page }) => {
            await page.goto('http://localhost:3000/dashboard');

            // Navigate to "My Listings" or similar
            await page.click('a:has-text("My Listings"), a:has-text("Selling")');

            // Should see the listing
            await expect(page.locator('text=Test Vintage T-Shirt')).toBeVisible();
        });

        test('should edit a listing', async ({ page }) => {
            await page.goto('http://localhost:3000/dashboard');
            await page.click('a:has-text("My Listings"), a:has-text("Selling")');

            // Click edit on first listing
            await page.locator('button:has-text("Edit"), a:has-text("Edit")').first().click();

            // Update title
            await page.fill('input[name="title"]', 'Test Vintage T-Shirt - UPDATED');
            await page.click('button[type="submit"]');

            // Verify update
            await expect(page.locator('text=UPDATED')).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('3. Browse & Search', () => {
        test('should browse category pages', async ({ page }) => {
            await page.goto('http://localhost:3000/category/clothing');

            // Should see listings
            await expect(page.locator('text=Clothing')).toBeVisible();

            // Should see filter sidebar
            await expect(page.locator('text=Price Range, text=Filters')).toBeVisible();
        });

        test('should use search functionality', async ({ page }) => {
            await page.goto('http://localhost:3000');

            // Find search input
            const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
            await searchInput.fill('vintage');
            await searchInput.press('Enter');

            // Should show search results
            await expect(page).toHaveURL(/.*search.*/);
        });

        test('should filter by price range', async ({ page }) => {
            await page.goto('http://localhost:3000/category/clothing');

            // Set price filters
            await page.fill('input[name="price_min"], input[placeholder*="Min"]', '10');
            await page.fill('input[name="price_max"], input[placeholder*="Max"]', '50');

            // Apply filters
            await page.click('button:has-text("Apply"), button[type="submit"]');

            // Wait for results to update
            await page.waitForTimeout(1000);
        });
    });

    test.describe('4. Purchasing Flow', () => {
        test.beforeEach(async ({ page }) => {
            // Login as buyer
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard.*/);
        });

        test('should view listing detail page', async ({ page }) => {
            // Browse to find a listing
            await page.goto('http://localhost:3000/category/clothing');

            // Click on first listing
            await page.locator('a:has-text("Test Vintage T-Shirt"), .listing-card').first().click();

            // Should be on listing detail page
            await expect(page.locator('text=Test Vintage T-Shirt')).toBeVisible();
            await expect(page.locator('button:has-text("Buy Now"), button:has-text("Purchase")')).toBeVisible();
        });

        test('should add item to basket/cart', async ({ page }) => {
            await page.goto('http://localhost:3000/category/clothing');
            await page.locator('a:has-text("Test Vintage T-Shirt")').first().click();

            // Add to cart
            await page.click('button:has-text("Add to Cart"), button:has-text("Add to Basket")');

            // Verify added
            await expect(page.locator('text=Added to cart, text=Added to basket')).toBeVisible({ timeout: 5000 });
        });

        test('should complete checkout process', async ({ page }) => {
            await page.goto('http://localhost:3000/category/clothing');
            await page.locator('a:has-text("Test Vintage T-Shirt")').first().click();

            // Click Buy Now
            await page.click('button:has-text("Buy Now"), button:has-text("Purchase")');

            // Should redirect to checkout
            await expect(page).toHaveURL(/.*checkout.*/);

            // Fill checkout form (if any)
            // Note: This depends on your checkout implementation

            // Complete purchase
            await page.click('button:has-text("Complete Purchase"), button:has-text("Pay Now")');

            // Should redirect to success page
            await expect(page).toHaveURL(/.*success|confirmation|order.*/);
        });
    });

    test.describe('5. Messaging System', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard.*/);
        });

        test('should send message about a listing', async ({ page }) => {
            await page.goto('http://localhost:3000/category/clothing');
            await page.locator('a:has-text("Test Vintage T-Shirt")').first().click();

            // Click message seller button
            await page.click('button:has-text("Message Seller"), button:has-text("Contact Seller")');

            // Should open messages page or modal
            await expect(page).toHaveURL(/.*messages.*/);

            // Type and send message
            await page.fill('textarea[name="message"], textarea[placeholder*="message"]', 'Hi, is this still available?');
            await page.click('button:has-text("Send")');

            // Verify message sent
            await expect(page.locator('text=is this still available')).toBeVisible({ timeout: 5000 });
        });

        test('should view message inbox', async ({ page }) => {
            await page.goto('http://localhost:3000/messages');

            // Should see conversations
            await expect(page.locator('text=Messages, text=Inbox')).toBeVisible();
        });

        test('should send direct message', async ({ page }) => {
            await page.goto('http://localhost:3000/messages');

            // Find a conversation and click it
            const conversation = page.locator('.conversation, [data-testid="conversation"]').first();
            if (await conversation.isVisible()) {
                await conversation.click();

                // Send a message
                await page.fill('textarea', 'Thanks for the quick response!');
                await page.click('button:has-text("Send")');

                await expect(page.locator('text=Thanks for the quick response')).toBeVisible();
            }
        });
    });

    test.describe('6. Dispute System', () => {
        test('should open a dispute', async ({ page }) => {
            // Login as buyer
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            // Go to orders/purchases
            await page.goto('http://localhost:3000/dashboard');
            await page.click('a:has-text("Orders"), a:has-text("Purchases")');

            // Find an order and open dispute
            const disputeButton = page.locator('button:has-text("Open Dispute"), button:has-text("Report Issue")').first();

            if (await disputeButton.isVisible()) {
                await disputeButton.click();

                // Fill dispute form
                await page.selectOption('select[name="reason"]', 'item_not_as_described');
                await page.fill('textarea[name="description"]', 'The item arrived damaged');

                await page.click('button:has-text("Submit Dispute")');

                // Verify dispute created
                await expect(page.locator('text=Dispute opened, text=Dispute submitted')).toBeVisible({ timeout: 5000 });
            }
        });

        test('should view dispute details', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/dashboard');
            await page.click('a:has-text("Disputes")');

            // Click on a dispute
            const dispute = page.locator('.dispute-item, [data-testid="dispute"]').first();
            if (await dispute.isVisible()) {
                await dispute.click();

                // Should see dispute details
                await expect(page.locator('text=Dispute Details, text=Status')).toBeVisible();
            }
        });
    });

    test.describe('7. Profile & Settings', () => {
        test('should view and edit profile', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            // Go to profile
            await page.goto('http://localhost:3000/profile');

            // Edit profile
            await page.click('button:has-text("Edit Profile"), a:has-text("Edit")');

            // Update bio
            await page.fill('textarea[name="bio"]', 'I love vintage fashion!');
            await page.click('button:has-text("Save")');

            // Verify update
            await expect(page.locator('text=I love vintage fashion')).toBeVisible({ timeout: 5000 });
        });

        test('should update settings', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/settings');

            // Toggle a setting
            const toggle = page.locator('input[type="checkbox"]').first();
            if (await toggle.isVisible()) {
                await toggle.click();

                // Save settings
                await page.click('button:has-text("Save")');

                await expect(page.locator('text=Settings saved, text=Updated')).toBeVisible({ timeout: 5000 });
            }
        });
    });

    test.describe('8. Dashboard Features', () => {
        test('should view dashboard overview', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/dashboard');

            // Verify dashboard elements
            await expect(page.locator('text=Dashboard, text=Overview')).toBeVisible();
            await expect(page.locator('text=Sales, text=Purchases')).toBeVisible();
        });

        test('should view environmental impact', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/dashboard');

            // Look for carbon/environmental metrics
            const carbonMetric = page.locator('text=Carbon, text=CO2, text=Environmental');
            await expect(carbonMetric).toBeVisible();
        });
    });

    test.describe('9. Reviews & Feedback', () => {
        test('should leave a review after purchase', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/dashboard');
            await page.click('a:has-text("Orders"), a:has-text("Purchases")');

            // Find completed order and leave review
            const reviewButton = page.locator('button:has-text("Leave Review"), button:has-text("Rate")').first();

            if (await reviewButton.isVisible()) {
                await reviewButton.click();

                // Rate 5 stars
                await page.click('[data-rating="5"], .star:nth-child(5)');

                // Write review
                await page.fill('textarea[name="review"]', 'Great seller, item exactly as described!');

                await page.click('button:has-text("Submit Review")');

                await expect(page.locator('text=Review submitted, text=Thank you')).toBeVisible({ timeout: 5000 });
            }
        });
    });

    test.describe('10. Favorites & Saved Items', () => {
        test('should add item to favorites', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/category/clothing');

            // Click favorite/heart icon
            await page.locator('button[aria-label="Add to favorites"], .favorite-button').first().click();

            // Verify added
            await expect(page.locator('text=Added to favorites, text=Saved')).toBeVisible({ timeout: 5000 });
        });

        test('should view saved items', async ({ page }) => {
            await page.goto('http://localhost:3000/auth/login');
            await page.fill('input[name="email"]', buyerEmail);
            await page.fill('input[name="password"]', buyerPassword);
            await page.click('button[type="submit"]');

            await page.goto('http://localhost:3000/favorites');

            // Should see favorited items
            await expect(page.locator('text=Favorites, text=Saved Items')).toBeVisible();
        });
    });
});
