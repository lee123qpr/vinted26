export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
};

export type Subcategory = {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    default_density_kg_per_m3: number;
    embodied_carbon_kg_per_kg: number;
    is_material_ambiguous: boolean;
};

export type Material = {
    id: string;
    name: string;
    density_kg_per_m3: number;
    embodied_carbon_kg_per_kg: number;
};
