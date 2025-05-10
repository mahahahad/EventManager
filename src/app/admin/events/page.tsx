"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/types/event";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AdminManageEventsPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
            return new Date(dateString).toLocaleString("en-AE", {
                timeZone: "Asia/Dubai",
            });
        }
        return "N/A";
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            setLoading(true);
            setError(null);

            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Error deleting event:", error);
                setError("Failed to delete event.");
            } else {
                // Update the local state to remove the deleted event
                setEvents(events.filter((event) => String(event.id) === id)); // Explicitly convert event.id to string
                // Optionally, show a success message
            }
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6 space-y-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Manage Events</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-black/30 backdrop-blur-lg shadow-md rounded-lg border border-black/40 dark:bg-gray-800/70 dark:border-gray-600">
                    <thead className="bg-black/50 dark:bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">
                                Title
                            </th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">
                                Location
                            </th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">
                                Start Time
                            </th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider hidden sm:table-cell">
                                End Time
                            </th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider hidden md:table-cell">
                                Public
                            </th>
                            <th className="py-3 px-4 text-left font-semibold uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr
                                key={event.id}
                                className="hover:bg-black/40 dark:hover:bg-gray-600"
                            >
                                <td className="py-3 px-4 whitespace-nowrap">
                                    {event.title}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    {event.location}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    {formatDate(event.start_time)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap hidden sm:table-cell">
                                    {formatDate(event.end_time)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap hidden md:table-cell">
                                    {event.is_public ? "Yes" : "No"}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <Link
                                        href={`/admin/events/${event.id}`}
                                        className="text-blue-500 hover:underline mr-2"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            handleDelete(String(event.id))
                                        }
                                        className="text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminManageEventsPage;
