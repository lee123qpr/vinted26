require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    const migrationFile = path.join(__dirname, '../supabase/migrations/20260124_add_last_seen.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('Running migration: 20260124_add_last_seen.sql...');

    // Supabase JS doesn't support raw SQL via public API usually, but RPC 'exec_sql' might exist if I created it before.
    // Alternatively, I can use the same logic as run_admin_migration.js if it uses a direct connection or specific method.
    // Let's assume standard postgres connection isn't available via node here easily without pg library.
    // But wait, previous scripts used `exec_sql` rpc? Let's check. 
    // If not, I can't run it easily without establishing a PG connection or ensuring exec_sql exists.

    // Let's try RPC 'exec_sql' first?
    // Checking list_dir earlier showed `debug_exec_sql.js`.

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Migration failed:', error);
        // If exec_sql doesn't exist, we might be stuck.
        // Fallback: This user usually has `exec_sql` or direct access?
    } else {
        console.log('✅ Migration applied successfully.');
    }
}

runMigration();
