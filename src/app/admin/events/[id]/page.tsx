"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/types/event"; // Assuming you have this type
import { IoArrowBack, IoChevronDown } from "react-icons/io5";
import { motion } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar"; // Import the navbar

const AdminEditEventPage = () => {
    const { id } = useParams(); // Get the event ID from the URL
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState<string | null>("");
    const [description, setDescription] = useState<string | null>("");
    const [isPublic, setIsPublic] = useState(false);
    const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] =
        useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(""); // New state for image URL

    const handleGoBack = () => {
        router.back();
    };

    useEffect(() => {
        const fetchEvent = async () => {
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
                    setTitle(data.title);
                    setLocation(data.location || "");
                    setStartTime(data.start_time);
                    setEndTime(data.end_time || "");
                    setDescription(data.description || "");
                    setIsPublic(data.is_public);
                    setImageUrl(data.image_url || ""); // Initialize image URL
                } else {
                    setError("Event not found.");
                }
            }
            setLoading(false);
        };

        fetchEvent();
    }, [id]);

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        if (id && event) {
            const { error } = await supabase
                .from("events")
                .update({
                    title,
                    location,
                    start_time: startTime,
                    end_time: endTime,
                    description,
                    is_public: isPublic,
                    updated_at: new Date().toISOString(),
                    image_url: imageUrl, // Include image URL in update
                })
                .eq("id", id);

            setSaving(false);

            if (error) {
                console.error("Error updating event:", error);
                setError("Failed to update event.");
            } else {
                console.log("Event updated successfully:", id);
                router.push("/admin/events");
            }
        }
    };

    const additionalOptionsVariants = {
        open: {
            height: "auto",
            opacity: 1,
            marginTop: "1rem",
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        },
        closed: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            transition: {
                duration: 0.2,
                ease: "easeInOut",
            },
        },
    };

    const chevronVariants = {
        open: { rotate: 180 },
        closed: { rotate: 0 },
    };

    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-white">
                Loading event details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-red-500">
                {error}
            </div>
        );
    }

    if (!event) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-red-500">
                Event not found.
            </div>
        );
    }

    return (
        <div className="bg-neutral-800 min-h-screen">
            <AdminNavbar /> {/* Include the navbar */}
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4 z-10">
                <button
                    onClick={handleGoBack}
                    className="fixed top-4 left-4 bg-black/40 hover:bg-black/60 text-white font-semibold py-2 px-3 rounded-full transition z-20"
                >
                    <IoArrowBack size={20} className="inline-block mr-1" /> Back
                </button>
                <div className="relative bg-black/30 backdrop-blur-lg shadow-lg rounded-[48px] w-[95%] md:w-[85%] h-auto max-h-[90%] overflow-auto p-6 sm:px-8 py-8 border border-black/40 dark:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200 text-white flex flex-col items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 self-start">
                        Edit Event
                    </h2>
                    <form onSubmit={handleUpdate} className="space-y-4 w-full">
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
                                className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
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
                                className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                value={location || ""}
                                onChange={(e) => setLocation(e.target.value)}
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
                                className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
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
                                className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                value={endTime || ""}
                                onChange={(e) => setEndTime(e.target.value)}
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
                                className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                value={description || ""}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setIsAdditionalDetailsOpen(
                                    !isAdditionalDetailsOpen
                                )
                            }
                            className="mt-4 text-blue-400 hover:text-blue-300 transition-colors flex items-center self-start"
                        >
                            Additional Options
                            <motion.span
                                className="ml-2"
                                variants={chevronVariants}
                                animate={
                                    isAdditionalDetailsOpen ? "open" : "closed"
                                }
                                style={{ display: "inline-flex" }}
                            >
                                <IoChevronDown size={20} />
                            </motion.span>
                        </button>

                        <motion.div
                            className="w-full overflow-y-auto mt-2"
                            variants={additionalOptionsVariants}
                            initial="closed"
                            animate={
                                isAdditionalDetailsOpen ? "open" : "closed"
                            }
                            style={{ maxHeight: "300px" }}
                        >
                            <div>
                                <label
                                    htmlFor="imageUrl"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Image URL:
                                </label>
                                <input
                                    type="url"
                                    id="imageUrl"
                                    className="mt-1 p-2 w-full rounded-md bg-neutral-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                    value={imageUrl || ""}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="isPublic"
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    checked={isPublic}
                                    onChange={(e) =>
                                        setIsPublic(e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="isPublic"
                                    className="ml-2 block text-sm font-medium text-gray-300"
                                >
                                    Public Event
                                </label>
                            </div>
                            {/* You can add other additional options here if needed */}
                        </motion.div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 shadow-md mt-6 self-start"
                        >
                            {saving ? "Saving..." : "Update Event"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditEventPage;
