// src/app/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/database";
import Navbar from "@/components/Navbar";
import EventsTable from "@/components/EventsTable";
import EventTableSkeleton from "@/components/EventTableSkeleton";
import EventCardShared, { EventCardSkeleton as SharedEventCardSkeleton } from "@/components/EventCard";
import FullScreenBackground from "@/components/FullScreenBackground";
import EventDialog from "@/components/EventDialog"; // Import EventDialog
import { Button } from "@/components/ui/button";
import { X, Search, XCircle, LayoutGrid, List } from "lucide-react";
import { useRouter } // Import useRouter if you want to navigate from dialog
from "next/navigation";


export default function EventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    
    // State for the dialog
    const [selectedEventForDialog, setSelectedEventForDialog] = useState<EventData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter(); // For navigating from dialog if needed


    const processEventData = (dbEvent: any): EventData => {
        const { event_tags, ...eventCoreProps } = dbEvent;
        return {
            ...eventCoreProps,
            tags: Array.isArray(event_tags)
                ? event_tags.map((et: any) => et.tags?.name).filter(Boolean) as string[]
                : [],
            event_tags: Array.isArray(event_tags) ? event_tags : [],
        };
    };
    
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from("events")
                .select("*, event_tags(tags(id, name))")
                .order("start_time", { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
                setError("Failed to fetch events.");
                setEvents([]);
            } else {
                const processedEvents = (data || []).filter(Boolean).map(processEventData);
                setEvents(processedEvents);
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredEvents(events);
            return;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = events.filter(
            (event) =>
                event.title?.toLowerCase().includes(lowercasedQuery) ||
                event.description?.toLowerCase().includes(lowercasedQuery) ||
                event.location?.toLowerCase().includes(lowercasedQuery) ||
                (event.tags &&
                    event.tags.some((tag) =>
                        tag.toLowerCase().includes(lowercasedQuery)
                    ))
        );
        setFilteredEvents(results);
    }, [searchQuery, events]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    // This function will be called by both EventsTable and EventCardShared
    const openEventDialog = (event: EventData) => {
        setSelectedEventForDialog(event);
        setIsDialogOpen(true);
    };

    return (
        <div className="relative min-h-screen text-white bg-black overflow-x-hidden">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1505238680356-667803448bb6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid="
                darkOverlay={true}
                blur={true}
                animatedGradient={false}
            />
            <Navbar />

            <main className="relative z-10 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 mt-20 sm:mt-24">
                <div className="bg-black/50 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                            All Events
                        </h1>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-64 md:w-72">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('table')}
                                    className={`rounded-lg ${viewMode === 'table' ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'}`}
                                    aria-label="Table view"
                                >
                                    <List className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-lg ${viewMode === 'grid' ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'}`}
                                    aria-label="Grid view"
                                >
                                    <LayoutGrid className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full">
                        {loading ? (
                            viewMode === 'table' ? <EventTableSkeleton /> : 
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <SharedEventCardSkeleton key={i} />)}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-red-900/20 border border-red-700 rounded-xl">
                                <XCircle className="w-12 h-12 text-red-400 mb-3" />
                                <p className="text-xl font-medium text-red-300">Error: {error}</p>
                                <p className="text-gray-400">Please try refreshing the page or contact support.</p>
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            viewMode === 'table' ? (
                                // EventsTable already uses EventDialog internally via its Info button
                                <EventsTable events={filteredEvents} />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEvents.map((event) => (
                                        <EventCardShared 
                                            key={event.id} 
                                            event={event} 
                                            onOpenDialog={openEventDialog} // Pass the handler here
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                                <Search className="w-12 h-12 text-gray-500 mb-3" />
                                <p className="text-xl font-medium text-gray-300">No Events Found</p>
                                <p className="text-gray-400">
                                    {searchQuery ? "Try adjusting your search query." : "There are currently no events to display."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            {/* EventDialog component for both table and grid views */}
            <EventDialog 
                isOpen={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                event={selectedEventForDialog} 
            />
        </div>
    );
}
