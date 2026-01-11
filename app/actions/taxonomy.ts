'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCategories() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        return { data, error: null };
    } catch (err: any) {
        console.error('Server Action Error (Categories):', err);
        return { data: null, error: err.message };
    }
}

export async function getMaterials() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('materials').select('*').order('name');
        if (error) throw error;
        return { data, error: null };
    } catch (err: any) {
        console.error('Server Action Error (Materials):', err);
        return { data: null, error: err.message };
    }
}

export async function getSubcategories(categoryId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('subcategories')
            .select('*')
            .eq('category_id', categoryId)
            .order('name');

        if (error) throw error;
        return { data, error: null };
    } catch (err: any) {
        console.error('Server Action Error (Subcategories):', err);
        return { data: null, error: err.message };
    }
}

export async function getSubSubcategories(subcategoryId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('sub_subcategories')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('name');

        if (error) throw error;
        return { data, error: null };
    } catch (err: any) {
        console.error('Server Action Error (SubSubcategories):', err);
        return { data: null, error: err.message };
    }
}
