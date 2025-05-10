"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/types/event";
import Link from "next/link";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const formatDate = (dateString: string | null | undefined) => {
        if (dateString) {
            return new Date(dateString).toLocaleString('en-AE', { timeZone: 'Asia/Dubai' });
        }
        return 'N/A';
    };

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">All Events</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-black/30 backdrop-blur-lg shadow-md rounded-lg border border-black/40 dark:bg-gray-800/70 dark:border-gray-600 text-white">
                    <thead className="bg-black/50 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">Location</th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">Start Time</th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider hidden sm:table-cell">End Time</th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider hidden md:table-cell">Public</th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-black/40 dark:hover:bg-gray-600">
                                <td className="py-3 px-4 whitespace-nowrap">{event.title}</td>
                                <td className="py-3 px-4 whitespace-nowrap">{event.location}</td>
                                <td className="py-3 px-4 whitespace-nowrap">{formatDate(event.start_time)}</td>
                                <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell">{formatDate(event.end_time)}</td>
                                <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">{event.is_public ? 'Yes' : 'No'}</td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <Link href={`/events/${event.id}`} className="text-blue-500 hover:underline">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
