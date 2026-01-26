require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = 'admin@vinted26.com';
    const password = 'AdminPassword123!';
    const username = 'AdminUser';

    console.log('👑 Creating Super Admin...');
    console.log(`Email: ${email}`);

    try {
        // 1. Create the user in Auth
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: 'System Admin',
                username: username
            }
        });

        let userId;

        if (createError) {
            if (createError.message.includes('already registered')) {
                console.log('⚠️ User already exists. Resetting password...');
                // Find ID
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const existingUser = users.find(u => u.email === email);

                if (existingUser) {
                    userId = existingUser.id;
                    const { error: resetError } = await supabase.auth.admin.updateUserById(
                        existingUser.id,
                        { password: password }
                    );
                    if (resetError) throw resetError;
                    console.log(`✅ Password reset for ${existingUser.id}`);
                } else {
                    throw new Error('User reported existing but not found in list?');
                }
            } else {
                throw createError;
            }
        } else {
            userId = user.id;
            console.log(`✅ Auth User Created: ${userId}`);
        }

        // 2. Update Profile to be Admin
        // Profile trigger should have run, but give it a split second just in case
        await new Promise(r => setTimeout(r, 1000));

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                is_admin: true,
                is_trade_verified: true,
                account_status: 'active'
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        console.log('✅ Promoted to Admin successfully.');
        console.log('------------------------------------------------');
        console.log('Login Credentials:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------------------------------');

    } catch (err) {
        console.error('Failed to create admin:', err.message);
    }
}

createAdmin();
