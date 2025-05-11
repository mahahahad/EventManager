export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    start_time: string; // Keep as string if that's how it comes from Supabase, format in display
    end_time?: string | null | undefined;
    source?: string | null | undefined; // Allow null
    external_id?: number | null | undefined; // Allow null
    image_url?: string | null | undefined;
    is_public: boolean;
    created_by?: string | null | undefined;
    created_at?: string | null | undefined;
    updated_at?: string | null | undefined;
    // Add any other fields you might have, e.g., created_at, campus_ids etc.
}
