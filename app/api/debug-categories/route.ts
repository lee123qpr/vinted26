
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // 1. Check Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    // 2. Check Subcategories
    const { data: subcategories, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .limit(5);

    // 3. Check Sub-sub
    const { data: subsub, error: subsubError } = await supabase
        .from('sub_subcategories')
        .select('*')
        .limit(5);

    // 4. Check the deep query used in Navigation
    const { data: deepData, error: deepError } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            subcategories (
                id, 
                name, 
                sub_subcategories (
                    id, 
                    name
                )
            )
        `)
        .limit(2);

    return NextResponse.json({
        categories_count: categories?.length,
        categories_sample: categories?.slice(0, 2),
        catError,
        subcategories_sample: subcategories,
        subError,
        subsub_sample: subsub,
        subsubError,
        deep_query_sample: deepData,
        deepError
    });
}
