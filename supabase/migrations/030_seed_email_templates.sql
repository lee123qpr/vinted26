-- Migration 030_seed_email_templates.sql

-- Insert default HTML templates
INSERT INTO email_templates (template_id, subject, body_html, description)
VALUES 
('welcome', 'Welcome to Skipped Marketplace!', '<h1>Welcome, {{username}}!</h1><p>We are thrilled to have you join our sustainable construction marketplace.</p>', 'The first email a user receives when they sign up.'),
('item-sold', 'Cha-ching! You sold an item', '<h2>Great news, {{sellerName}}!</h2><p>{{buyerName}} has purchased your <strong>{{itemName}}</strong> for {{itemPrice}}.</p>', 'Sent to sellers when a buyer completes checkout.'),
('order-confirmation', 'Order Confirmed: {{itemName}}', '<h2>Thanks for your order, {{buyerName}}!</h2><p>You have successfully purchased <strong>{{itemName}}</strong> for {{totalPrice}}. Here is your order ID: {{orderId}}.</p>', 'Sent to buyers as a receipt right after checkout.'),
('order-shipped', 'Update: Your item has shipped', '<h2>Hello {{buyerName}},</h2><p>Your order for <strong>{{itemName}}</strong> is on its way!</p>', 'Sent to buyers when sellers click Mark as Shipped.'),
('reset-password', 'Reset Your Password', '<h2>Password Reset Request</h2><p>Click the link below to securely reset your password.</p>', 'Security email for lost passwords.'),
('admin-warning', 'Account Warning Notice', '<h2>Important Account Notice</h2><p>Your account has violated our community guidelines.</p>', 'Sent manually or automatically to warn users of bad behavior.'),
('dispute-update', 'Action Required: Dispute Update', '<h2>Dispute Update for {{userName}}</h2><p>Dispute ID: {{disputeId}}</p><p><strong>Message:</strong> {{message}}</p>', 'Sent when an admin interacts with an open dispute.')
ON CONFLICT (template_id) DO UPDATE 
SET subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;
