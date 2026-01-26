require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking exec_sql capability...');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT 1 as result;' });

    if (error) {
        console.error('❌ exec_sql failed:', error.message);
        console.log('   (This means I cannot run migrations via script)');
        return;
    }

    console.log('✅ exec_sql works!', data);

    console.log('Checking constraint existence...');
    const checkSql = `
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'newsletter_subscribers'::regclass 
        AND conname = 'email_validation_check';
    `;
    const { data: constraintData, error: constraintError } = await supabase.rpc('exec_sql', { sql_query: checkSql });

    if (constraintError) {
        console.error('❌ Failed to check constraint:', constraintError.message);
    } else {
        console.log('Constraint check result:', constraintData);
        if (constraintData && constraintData.length > 0) {
            console.log('✅ Constraint EXISTS!');
        } else {
            console.log('❌ Constraint does NOT exist.');
        }
    }
}

check();
