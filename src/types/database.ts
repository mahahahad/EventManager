// In a types file, e.g., src/types/index.ts or src/types/database.ts

export interface UserProfile {
    // From your 'users' table
    id: string; // UUID
    display_name: string | null;
    email: string;
    is_admin: boolean;
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string
}

export interface Tag {
    id: string; // UUID
    name: string;
    created_at?: string; // ISO date string
}

// Interface for the raw data fetched from event_tags join including the nested tag
export interface EventTagLinkRaw {
    event_id: string; // UUID
    tag_id: string; // UUID
    tags: Tag; // The nested Tag object when joining
    // assigned_at?: string;
}

export interface Event {
    id: string; // UUID
    title: string;
    description: string | null;
    start_time: string; // ISO date string
    end_time: string | null; // ISO date string
    location: string | null;
    external_id: string | null;
    source: string | null;
    created_by: string | null; // UUID of user
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string

    // For related data after processing Supabase joins:
    tags?: string[]; // Array of tag names, processed from event_tags
    // Or, if you prefer to keep the full tag objects:
    // event_tags?: Tag[]; // Processed array of Tag objects
}

export interface EventRegistration {
    id: string; // UUID (specific to the registration itself)
    user_id: string; // UUID
    event_id: string; // UUID
    registration_time: string; // ISO date string
    attended: boolean | null;

    // Optional: Include the full event object if you fetch it with a join
    event?: Event;
}

export interface UserEventRating {
    id: string; // UUID (specific to the rating itself)
    user_id: string; // UUID
    event_id: string; // UUID
    rating: number; // 1-5
    comment: string | undefined;
    rated_at: string; // ISO date string

    // Optional: Include the full event object
    event?: Event;
}

// For your DashboardPage component states:
export interface RegisteredEvent extends Event {
    // Event with registration details
    registration_time: string;
    attended?: boolean | null;
    user_rating?: number | null; // Added from user_event_ratings
}

export interface PastEvent extends Event {
    // Event that has passed, for rating
    attended?: boolean | null;
    user_rating?: number | null; // User's current rating for this event
}

// For recommendations (if you add a score)
export interface RecommendedEvent extends Event {
    recommendationScore?: number;
}
