"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { IoArrowBack } from "react-icons/io5";

export default function EventDetailPage() {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError(null);

            if (id) {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) {
                    console.error("Error fetching event:", error);
                    setError("Failed to fetch event details.");
                } else if (data) {
                    setEvent(data);
                } else {
                    setError("Event not found.");
                }
            } else {
                setError("Invalid event ID.");
            }
            setLoading(false);
        };

        fetchEvent();
    }, [id]);

    if (loading) {
        return <div>Loading event details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!event) {
        return <div>Event not found.</div>;
    }

    const handleGoBack = () => {
        router.back();
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (dateString) {
            return new Date(dateString).toLocaleString("en-AE", {
                timeZone: "Asia/Dubai",
            });
        }
        return "N/A";
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4">
            <button
                onClick={handleGoBack}
                className="fixed top-4 left-4 bg-black/40 hover:bg-black/60 text-white font-semibold py-2 px-3 rounded-full transition z-20"
            >
                <IoArrowBack size={20} className="inline-block mr-1" /> Back
            </button>
            <div className="relative bg-black/30 backdrop-blur-lg shadow-lg rounded-[48px] w-[90%] md:w-[85%] h-auto max-h-[90%] overflow-auto p-6 sm:px-8 py-8 border border-black/40 dark:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200 text-white">
                <div className="mt-16 sm:mt-16">
                    {" "}
                    {/* Adjust top margin to avoid overlap if needed */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                        {event.title}
                    </h1>
                    <p className="mb-2">
                        <strong className="mr-1">Location:</strong>{" "}
                        {event.location}
                    </p>
                    <p className="mb-2">
                        <strong className="mr-1">Start Time:</strong>{" "}
                        {formatDate(event.start_time)}
                    </p>
                    <p className="mb-2">
                        <strong className="mr-1">End Time:</strong>{" "}
                        {formatDate(event.end_time)}
                    </p>
                    {event.description && (
                        <div className="mt-4 overflow-auto break-words whitespace-pre-wrap">
                            <h2 className="text-lg font-semibold mb-2">
                                Description
                            </h2>
                            <p>{event.description}</p>
                        </div>
                    )}
                    {event.image_url && (
                        <div className="mt-4">
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="rounded-md max-w-full h-auto"
                            />
                        </div>
                    )}
                    <p className="mt-4">
                        <strong className="mr-1">Source:</strong> {event.source}
                    </p>
                    {event.external_id && (
                        <p className="mb-2">
                            <strong className="mr-1">External ID:</strong>{" "}
                            {event.external_id}
                        </p>
                    )}
                    <p className="mb-2">
                        <strong className="mr-1">Public:</strong>{" "}
                        {event.is_public ? "Yes" : "No"}
                    </p>
                    <p className="mb-2">
                        <strong className="mr-1">Created At:</strong>{" "}
                        {formatDate(event.created_at)}
                    </p>
                    <p className="mb-2">
                        <strong className="mr-1">Updated At:</strong>{" "}
                        {formatDate(event.updated_at)}
                    </p>
                </div>
            </div>
        </div>
    );
}
