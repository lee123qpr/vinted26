export interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    created_at: string;
    email?: string;
    full_name?: string;
    total_sales?: number;
    total_purchases?: number;
    total_carbon_saved_kg?: number;
    is_admin?: boolean;
    account_status?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    sort_order?: number;
    subcategories: SubCategory[];
}

export interface SubCategory {
    id: string;
    name: string;
    slug: string;
    sort_order?: number;
    sub_subcategories?: SubSubCategory[]; // Make optional or strictly typed? Previous was []
    default_density_kg_per_m3?: number;
    embodied_carbon_kg_per_kg?: number;
    is_material_ambiguous?: boolean;
}

export interface SubSubCategory {
    id: string;
    name: string;
    slug: string;
    sort_order?: number;
}
