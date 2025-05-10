"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AdminCreateEventPage = () => {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("events")
            .insert([
                {
                    title,
                    location,
                    start_time: startTime,
                    end_time: endTime,
                    description,
                    is_public: isPublic,
                },
            ])
            .select();

        setLoading(false);

        if (error) {
            console.error("Error creating event:", error);
            setError("Failed to create event.");
        } else if (data && data.length > 0) {
            console.log("Event created successfully:", data);
            // Redirect to the manage events page or show a success message
            router.push("/admin/events");
        }
    };

    return (
        <div className="p-6 space-y-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Title:
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Location:
                    </label>
                    <input
                        type="text"
                        id="location"
                        className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Start Time:
                    </label>
                    <input
                        type="datetime-local"
                        id="startTime"
                        className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="endTime"
                        className="block text-sm font-medium text-gray-300"
                    >
                        End Time:
                    </label>
                    <input
                        type="datetime-local"
                        id="endTime"
                        className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Description:
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublic"
                        className="mr-2 rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-black/50"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <label
                        htmlFor="isPublic"
                        className="text-sm font-medium text-gray-300"
                    >
                        Public Event
                    </label>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {loading ? "Creating..." : "Create Event"}
                </button>
                {error && <p className="text-red-500">{error}</p>}
            </form>
        </div>
    );
};

export default AdminCreateEventPage;
