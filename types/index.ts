export interface Profile {
    id: string;
    username: string;
    avatar_url?: string;
    created_at: string;
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
    sub_subcategories: SubSubCategory[];
}

export interface SubSubCategory {
    id: string;
    name: string;
    slug: string;
    sort_order?: number;
}
