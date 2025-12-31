export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            listings: {
                Row: {
                    id: string
                    title: string
                    description: string
                    price_gbp: number
                    status: string
                    created_at: string
                    seller_id: string
                    category_id: string
                    subcategory_id: string
                    sub_subcategory_id: string | null
                    location_lat: number | null
                    location_lng: number | null
                    postcode_area: string | null
                    weight_kg: number | null
                    condition: string
                    is_free: boolean
                    collection_notes: string | null
                    include_carbon_certificate: boolean
                    carbon_saved_kg: number
                    landfill_diverted_kg: number
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    price_gbp: number
                    status?: string
                    created_at?: string
                    seller_id?: string
                    category_id: string
                    subcategory_id: string
                    sub_subcategory_id?: string | null
                    location_lat?: number | null
                    location_lng?: number | null
                    postcode_area?: string | null
                    weight_kg?: number | null
                    condition: string
                    is_free?: boolean
                    collection_notes?: string | null
                    include_carbon_certificate?: boolean
                    carbon_saved_kg?: number
                    landfill_diverted_kg?: number
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    price_gbp?: number
                    status?: string
                    created_at?: string
                    seller_id?: string
                    category_id?: string
                    subcategory_id?: string
                    sub_subcategory_id?: string | null
                    location_lat?: number | null
                    location_lng?: number | null
                    postcode_area?: string | null
                    weight_kg?: number | null
                    condition?: string
                    is_free?: boolean
                    collection_notes?: string | null
                    include_carbon_certificate?: boolean
                    carbon_saved_kg?: number
                    landfill_diverted_kg?: number
                }
            }
            listing_images: {
                Row: {
                    id: string
                    listing_id: string
                    image_url: string
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    listing_id: string
                    image_url: string
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    listing_id?: string
                    image_url?: string
                    sort_order?: number
                    created_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    icon_name: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    icon_name?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    icon_name?: string | null
                }
            }
        }
    }
}
