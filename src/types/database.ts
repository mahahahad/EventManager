// In a types file, e.g., src/types/index.ts or src/types/database.ts

export interface UserProfile {
    // ... (rest of UserProfile)
    id: string; // UUID
    display_name: string | null;
    email: string; // Assuming email is present
    is_admin: boolean;
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string
}

export interface Tag {
    // ... (rest of Tag)
    id: string; // UUID
    name: string;
    created_at?: string; // ISO date string
}

export interface EventTagLinkRaw {
    // ... (rest of EventTagLinkRaw)
    event_id: string; // UUID
    tag_id: string; // UUID
    tags: Tag; 
}

export interface Event {
    id: string; // UUID
    title: string;
    description: string | null;
    start_time: string; // ISO date string
    end_time: string | null; // ISO date string
    location: string | null;
    image_url: string | null;   // <<< ADDED THIS LINE (make it optional if it can be null in DB)
    external_id: string | null;
    source: string | null;
    is_public: boolean;         // <<< ADDED THIS LINE (type should match your DB column)
    created_by: string | null; // UUID of user
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string

    // For related data after processing Supabase joins (as used on Dashboard):
    tags?: string[]; // Array of tag names, processed from event_tags
}

export interface EventRegistration {
    // ... (rest of EventRegistration)
    id: string; 
    user_id: string; 
    event_id: string; 
    registration_time: string; 
    attended: boolean | null;
    event?: Event;
}

export interface UserEventRating {
    // ... (rest of UserEventRating)
    id: string; 
    user_id: string; 
    event_id: string; 
    rating: number; 
    comment: string | undefined; // Consider string | null if your DB stores NULL for empty comments
    rated_at: string; 
    event?: Event;
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
