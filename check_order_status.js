
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // ID from previous log for 'logo for sale'
    const orderId = '66479bfa-7684-415e-b9d9-bbe8a19923cf';

    console.log(`Checking status for order ${orderId}...`);

    const { data: order, error } = await supabase
        .from('transactions')
        .select('id, order_status, payment_status, buyer_id, seller_id')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Order Data:", JSON.stringify(order, null, 2));
    }
}

main();
