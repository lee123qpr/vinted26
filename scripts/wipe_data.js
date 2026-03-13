import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or URL in .env.local');
  process.exit(1);
}

// Bypass RLS using the service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function wipeData() {
  console.log('⚠️ Starting full user data wipe for testing...');
  
  try {
    // 0. Disputes (depends on users/transactions)
    console.log('Deleting disputes...');
    const { error: dispErr } = await supabase.from('disputes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (dispErr) throw dispErr;

    // 0.5. Reviews (depends on users/transactions)
    console.log('Deleting reviews...');
    const { error: revErr } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (revErr) throw revErr;

    // 1. Transactions (depends on listings/users)
    console.log('Deleting transactions...');
    const { error: txErr } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (txErr) throw txErr;

    // 2. Offers (depends on listings/users)
    console.log('Deleting offers...');
    const { error: offErr } = await supabase.from('offers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (offErr) throw offErr;

    // 2.5. Conversations (depends on users/messages)
    console.log('Deleting conversations...');
    const { error: convErr } = await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (convErr) throw convErr;

    // 3. Messages (depends on users/transactions)
    console.log('Deleting messages...');
    const { error: msgErr } = await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (msgErr) throw msgErr;

    // 4. Notifications
    console.log('Deleting notifications...');
    const { error: notifErr } = await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (notifErr) throw notifErr;
    
    // 5. Listing Images (depends on listings)
    console.log('Deleting listing images...');
    const { error: imgErr } = await supabase.from('listing_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (imgErr) throw imgErr;
    
    // 6. Favorites
    console.log('Deleting favorites...');
    const { error: favErr } = await supabase.from('favourites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (favErr) throw favErr;

    // 7. Listings (depends on users/categories)
    console.log('Deleting listings...');
    const { error: listErr } = await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (listErr) throw listErr;

    // 8. Profiles (Users)
    console.log('Deleting user profiles...');
    // We do NOT delete the primary admin account if it exists, to avoid locking ourselves out 
    // Usually auth.users drives profiles, so deleting from public.profiles is enough for app reset, 
    // but the users will still exist in auth unless deleted via Supabase dashboard.
    const { error: profErr } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profErr) throw profErr;

    console.log('✅ Successfully wiped all user transaction, listing, message, and profile data.');
    console.log('ℹ️ Note: Core auth accounts still exist in Supabase Identity. You may need to delete test users in the Supabase Dashboard -> Authentication section to fully reset email availability.');
    
  } catch (error) {
    console.error('❌ Error wiping data:', error);
  }
}

wipeData();
