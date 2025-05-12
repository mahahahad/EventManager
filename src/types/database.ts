// src/types/database.ts

export interface UserProfile {
    id: string; // UUID from your public 'users' table
    full_name: string | null; // Added from your 'users' table schema
    email: string; // Assuming this is from 'users' table, matches schema
    display_name: string | null; // From your 'users' table schema
    is_admin: boolean; // From your 'users' table schema
    // 'created_at' and 'updated_at' are typically on auth.users, not usually duplicated
    // on a public 'users' profile table unless you explicitly manage them there.
    // Removed them to align with the 'users' table schema provided.
}

export interface Tag {
    id: string; // UUID
    name: string;
    created_at?: string; // ISO date string, timestamptz from schema
}

/**
 * Represents a row from the 'event_tags' join table,
 * where the related 'tags' data is also fetched.
 * This type is suitable if you query 'event_tags' directly and join 'tags',
 * e.g., supabase.from('event_tags').select('*, tags!inner(*)')
 */
export interface EventTagLinkRaw {
    event_id: string; // UUID
    tag_id: string; // UUID
    assigned_at: string; // timestamptz from your 'event_tags' schema
    tags: Tag; // The full related Tag object
}


export interface Event {
    id: string; // UUID
    title: string;
    description: string | null;
    start_time: string; // ISO date string
    end_time: string | null; // ISO date string
    location: string | null;
    image_url: string | null;
    external_id: number | null; // Changed from string to number to match int4 in schema
    source: string | null;
    is_public: boolean;
    created_by: string | null; // UUID of user
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string

    /**
     * Raw structure from Supabase when fetching events with nested tags
     * using a query like: .select('*, event_tags(tags(name))')
     * Each item in the array corresponds to an entry in the 'event_tags' join table
     * for this event, with the specified nested 'tags' data.
     */
    event_tags?: Array<{
        // If you query `event_tags(assigned_at, tags(name))`, you'd add:
        // assigned_at?: string;

        tags: { // Represents the 'tags' table data
            name: string | null;
            // If you query `tags(id, name)`, you'd add:
            // id?: string;
        } | null; // The 'tags' object could be null if RLS prevents access or join fails
    }>;

    /**
     * For related data after processing Supabase joins (e.g., in application logic).
     * This is an array of tag names, processed from the raw 'event_tags' structure.
     */
    tags?: string[];
}

export interface EventRegistration {
    id: string; // uuid from schema
    user_id: string; // uuid from schema
    event_id: string; // uuid from schema
    registration_time: string; // timestamptz from schema
    attended: boolean | null; // bool from schema
    event?: Event; // Optional joined event data
}

export interface UserEventRating {
    id: string; // uuid from schema
    user_id: string; // uuid from schema
    event_id: string; // uuid from schema
    rating: number; // int4 from schema
    comment: string | null; // text from schema, changed from string | undefined
    rated_at: string; // timestamptz from schema
    event?: Event; // Optional joined event data
}

// For your DashboardPage component states:
export interface RegisteredEvent extends Event {
    registration_time: string;
    attended?: boolean | null;
    user_rating?: number | null;
}

export interface PastEvent extends Event {
    attended?: boolean | null;
    user_rating?: number | null;
}

// For recommendations (if you add a score)
export interface RecommendedEvent extends Event {
    recommendationScore?: number;
}
