const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResend() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ RESEND_API_KEY is missing');
        return;
    }

    console.log('📧 Testing Resend with key:', apiKey.slice(0, 5) + '...');

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev', // Safest test address
            subject: 'Skipped Marketplace Domain Check',
            html: '<p>If you see this, Resend is working for <strong>www.skipped-uk.com</strong>!</p>'
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully!');
            console.log('   ID:', data.id);
        }
    } catch (e) {
        console.error('❌ Exception:', e);
    }
}

testResend();
