"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar"; // Import the navbar

interface Event {
    id: string;
    title: string;
    start_time: string;
    // Add other relevant event properties
}

const AdminEventsPage = () => {
    const [events, setEvents] = useState<Event[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("events")
                .select("*") // Select all event details for the admin page
                .order("start_time", { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
                setError("Failed to fetch events.");
            } else if (data) {
                setEvents(data);
            }

            setLoading(false);
        };

        fetchEvents();
    }, []);

    const handleDeleteEvent = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);
            if (error) {
                console.error("Error deleting event:", error);
                alert("Failed to delete event.");
            } else {
                setEvents(
                    events ? events.filter((event) => event.id !== id) : []
                );
                alert("Event deleted successfully!");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                Loading events...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="bg-neutral-800 min-h-screen">
            <AdminNavbar /> {/* Include the navbar */}
            <div className="p-6 space-y-4 text-white">
                <h1 className="text-3xl font-bold mb-6">Manage Events</h1>
                <Link
                    href="/admin/events/create"
                    className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                >
                    Create New Event
                </Link>

                {events && events.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-neutral-800 rounded-md shadow-md">
                            <thead className="bg-neutral-700">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                        Title
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                                        Start Time
                                    </th>
                                    {/* Add other relevant columns */}
                                    <th className="py-3 px-6 text-right text-xs font-medium uppercase tracking-wider text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700">
                                {events.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-neutral-900"
                                    >
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {event.title}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {new Date(
                                                event.start_time
                                            ).toLocaleString()}
                                        </td>
                                        {/* Add other relevant data */}
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/events/${event.id}`}
                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDeleteEvent(event.id)
                                                }
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No events found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminEventsPage;
