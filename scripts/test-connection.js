const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log('--- Supabase Connectivity Test ---');

    // 1. Load Environment Variables
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file not found.');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};

    console.log('Scanning .env.local lines:');
    envContent.split(/\r?\n/).forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Match KEY=VALUE, export KEY=VALUE
        // Loose matching to capture more
        const match = trimmed.match(/^(?:export\s+)?([^=]+?)\s*=\s*(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
            console.log(`  [${idx + 1}] Found Key: ${key}`);
        } else {
            console.log(`  [${idx + 1}] Ignored/Unmatched: ${trimmed.substring(0, 10)}...`);
        }
    });

    const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        return;
    }

    console.log(`✅ Loaded Env Vars. URL: ${supabaseUrl.substring(0, 15)}...`);

    // 2. Initialize Client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Test Public Read (Categories)
    console.log('\nTesting Public Read (Categories table)...');
    const { data: categories, error: readError } = await supabase
        .from('categories')
        .select('count', { count: 'exact', head: true });

    if (readError) {
        console.error('❌ Public read failed:', readError.message);
        if (readError.code === 'PGRST301') {
            console.error('   Hint: URLs might be wrong or table permissions invalid.');
        }
    } else {
        console.log('✅ Public read successful. Connection is working.');
    }

    // 4. Test Auth (Sign Up)
    console.log('\nTesting Auth (Sign Up)...');
    const timestamp = Date.now();
    const testEmail = `vinted26_test_${timestamp}@gmail.com`;
    const testPassword = 'Password123!';
    const testUsername = `user_${timestamp}`;
    const testName = 'Test Verify';

    console.log(`   Email: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
            data: {
                username: testUsername,
                full_name: testName
            }
        }
    });

    if (authError) {
        console.error('❌ Sign Up failed:', authError.message);
    } else {
        console.log('✅ Sign Up successful.');
        console.log(`   User ID: ${authData.user?.id}`);

        // Check if profile was created (should fail currently, or succeed if Trigger exists)
        // Wait a sec for trigger
        await new Promise(r => setTimeout(r, 2000));

        const { data: profile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profile) {
            console.log('✅ Profile found (Trigger likely working already or insert succeeded).');
        } else {
            console.log('INFO: Profile not found. This confirms the need for a trigger/fix if the client code expects it.');
            if (profileCheckError) console.log(`   Profile Check Error: ${profileCheckError.message} (likely RLS denied reading own profile if not logged in context)`);
        }
    }

}

main().catch(err => console.error('Unexpected error:', err));
