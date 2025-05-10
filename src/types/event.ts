// Define a more specific EventData type
export interface Event {
    id: number;
    title: string;
    description?: string;
    location: string;
    start_time: string; // Keep as string if that's how it comes from Supabase, format in display
    end_time?: string | null;
    source?: string | null; // Allow null
    external_id?: number | null; // Allow null
    image_url?: string | null;
    is_public: boolean;
    created_by?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    // Add any other fields you might have, e.g., created_at, campus_ids etc.
}
