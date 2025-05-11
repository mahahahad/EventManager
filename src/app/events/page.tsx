"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/event";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EventsTable from "@/components/EventsTable"; // Import your EventsTable component
import EventTableSkeleton from "@/components/EventTableSkeleton"; // Import the skeleton component
import FullScreenBackground from "@/components/FullScreenBackground"; // Import the background component
import { X } from "lucide-react";

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
                setEvents(data || []);
            }
            setLoading(false);
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const results = events.filter((event) =>
            Object.values(event).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        setFilteredEvents(results);
    }, [searchQuery, events]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div className="relative min-h-screen text-white pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG0dby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                darkOverlay={true}
                animatedGradient={false} // You can enable this if you like on this page
            />

            <Navbar />
            <div className="relative z-10 p-6 space-y-6 max-w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300">
                        All Events
                    </h2>
                    <div className="relative w-64">
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-md bg-black/50 border border-neutral-600 text-white focus:outline-none focus:border-blue-500 pr-10"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-white focus:outline-none"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
                {loading ? (
                    <EventTableSkeleton />
                ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                ) : (
                    <EventsTable events={filteredEvents} />
                )}
                {/* Use your EventsTable here */}
            </div>
        </div>
    );
}
