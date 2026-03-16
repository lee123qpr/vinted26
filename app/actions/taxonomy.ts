'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCategories() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        return { data, error: null };
    } catch (err: unknown) {
        console.error('Error fetching categories:', err);
        return { data: null, error: 'Failed to load categories' };
    }
}

export async function getMaterials(categoryId?: string) {
    try {
        const supabase = await createClient();
        
        let query = supabase.from('materials').select('*');
        
        // If a categoryId is provided, ONLY return materials mapped to that category
        if (categoryId) {
            // First get mapped material IDs
            const { data: mappingData, error: mapErr } = await supabase
                .from('category_materials')
                .select('material_id')
                .eq('category_id', categoryId);
                
            if (mapErr) throw mapErr;
            
            if (mappingData && mappingData.length > 0) {
                const materialIds = mappingData.map(m => m.material_id);
                query = query.in('id', materialIds);
            } else {
                // If no mappings exist yet, maybe return empty or fallback to all?
                // Let's fallback to all just in case a new category forgets mapping.
            }
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error fetching materials:', error);
        return { data: null, error: error.message };
    }
}

export async function getSubcategories(categoryId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('subcategories')
            .select(`
                id,
                name,
                slug,
                sort_order,
                default_density_kg_per_m3,
                embodied_carbon_kg_per_kg,
                is_material_ambiguous,
                is_volumetric_calculation_valid
            `)
            .eq('category_id', categoryId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (err: unknown) {
        console.error('Error fetching subcategories:', err);
        return { data: null, error: 'Failed to load subcategories' };
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
    } catch (err: unknown) {
        console.error('Server Action Error (SubSubcategories):', err);
        return { data: null, error: err instanceof Error ? err.message : 'An unknown error occurred' };
    }
}
