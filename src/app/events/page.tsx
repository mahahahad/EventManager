// src/app/events/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/database";
import Navbar from "@/components/Navbar";
import EventsTable from "@/components/EventsTable";
import EventTableSkeleton from "@/components/EventTableSkeleton";
import FullScreenBackground from "@/components/FullScreenBackground";
import { X, Search, XCircle } from "lucide-react"; // Ensure XCircle is imported

export default function EventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("start_time", { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
                setError("Failed to fetch events.");
            } else {
                setEvents((data || []) as EventData[]);
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

    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                darkOverlay={true}
                blur={true}
            />
            <Navbar />

            <main className="relative z-10 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 mt-20 sm:mt-24">
                <div className="bg-black/50 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50">
                    {" "}
                    {/* Main rounded container */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                        {" "}
                        {/* Increased mb-8 for more space */}
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                            All Events
                        </h1>
                        <div className="relative w-full sm:w-72 md:w-80">
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
                    </div>
                    {/* This div ensures the table (or its container) can use the full width of its parent */}
                    <div className="w-full">
                        {loading ? (
                            <EventTableSkeleton />
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-red-900/20 border border-red-700 rounded-xl">
                                <XCircle className="w-12 h-12 text-red-400 mb-3" />
                                <p className="text-xl font-medium text-red-300">
                                    Error: {error}
                                </p>
                                <p className="text-gray-400">
                                    Please try refreshing the page or contact
                                    support.
                                </p>
                            </div>
                        ) : filteredEvents.length > 0 ? (
                            <EventsTable events={filteredEvents} />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-gray-800/30 border border-gray-700 rounded-xl">
                                <Search className="w-12 h-12 text-gray-500 mb-3" />
                                <p className="text-xl font-medium text-gray-300">
                                    No Events Found
                                </p>
                                <p className="text-gray-400">
                                    {searchQuery
                                        ? "Try adjusting your search query."
                                        : "There are currently no events to display."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
