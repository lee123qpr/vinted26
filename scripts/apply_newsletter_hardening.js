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
    console.log('Running newsletter hardening migration...\n');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260124_harden_newsletter.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Remove full line comments and split by semi-colons
    const statements = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
        if (!statement) continue;

        try {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

            if (error) {
                console.error(`❌ Error: ${error.message}`);
                console.error(`   Statement: ${statement}`);
                errorCount++;
            } else {
                successCount++;
                console.log('✅ Statement executed');
            }
        } catch (err) {
            console.error(`❌ Exception: ${err.message}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failures: ${errorCount}`);

    if (errorCount > 0) {
        process.exit(1);
    }
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
