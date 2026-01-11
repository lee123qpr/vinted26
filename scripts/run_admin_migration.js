require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    console.log('Running admin enhancements migration...\n');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260111_admin_enhancements.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out comments and empty statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
        if (!statement) continue;

        try {
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

            if (error) {
                // Try direct execution if RPC doesn't exist
                const { error: directError } = await supabase.from('_').select('*').limit(0);

                // Since we can't execute arbitrary SQL via client, we'll use a workaround
                console.log('⚠️  Statement needs manual execution or Supabase CLI');
                console.log(statement.substring(0, 60) + '...\n');
                errorCount++;
            } else {
                successCount++;
                console.log('✅ Statement executed');
            }
        } catch (err) {
            console.log('ℹ️  Skipping (may already exist): ' + statement.substring(0, 60) + '...');
        }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Skipped/Errors: ${errorCount}`);
    console.log(`\n⚠️  Note: Some statements may require Supabase CLI or dashboard execution.`);
    console.log(`   Run: npx supabase db push`);
    console.log(`   Or execute the migration file in Supabase SQL Editor.`);
}

runMigration()
    .then(() => {
        console.log('\n✅ Migration script completed');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    });
