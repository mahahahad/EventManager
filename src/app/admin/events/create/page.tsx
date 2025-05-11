"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IoArrowBack, IoChevronDown } from "react-icons/io5";
import { motion } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar"; // Import the navbar

const AdminCreateEventPage = () => {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>("");
    const [isPublic, setIsPublic] = useState(true);
    const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(""); // New state for image URL
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

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
                    image_url: imageUrl, // Include image URL
                },
            ])
            .select();

        setLoading(false);

        if (error) {
            console.error("Error creating event:", error);
            setError("Failed to create event.");
        } else if (data && data.length > 0) {
            console.log("Event created successfully:", data);
            router.push("/admin/events");
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

    return (
        <div className="bg-neutral-800 min-h-screen">
            <AdminNavbar /> {/* Include the navbar */}
            <div className="flex justify-center items-center p-4 z-10"> {/* Removed 'fixed top-0 left-0 w-full h-full' */}
                <button
                    onClick={handleGoBack}
                    className="fixed top-4 left-4 bg-black/40 hover:bg-black/60 text-white font-semibold py-2 px-3 rounded-full transition z-20"
                >
                    <IoArrowBack size={20} className="inline-block mr-1" /> Back
                </button>
                <div className="relative bg-black/30 backdrop-blur-lg shadow-lg rounded-[48px] w-[95%] md:w-[85%] h-auto max-h-[90%] overflow-auto p-6 sm:px-8 py-8 border border-black/40 dark:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200 text-white flex flex-col items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 self-start">
                        Create New Event
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title:</label>
                            <input type="text" id="title" className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start Time:</label>
                            <input type="datetime-local" id="startTime" className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description:</label>
                            <textarea id="description" rows={4} className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={description || ""} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <button
                            type="button" // Ensure this button does NOT submit the form
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
                                <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location:</label>
                                <input type="text" id="location" className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={location || ""} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-400">End Time:</label>
                                <input type="datetime-local" id="endTime" className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={endTime || ""} onChange={(e) => setEndTime(e.target.value)} />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="isPublic" className="mr-2 rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-black/50" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                                <label htmlFor="isPublic" className="text-sm font-medium text-gray-400">Public Event</label>
                            </div>
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-400">Image URL:</label>
                                <input type="url" id="imageUrl" className="mt-1 p-2 w-full rounded-md bg-black/50 border border-gray-700 text-white" value={imageUrl || ""} onChange={(e) => setImageUrl(e.target.value)} />
                            </div>
                            {/* Add other additional fields here */}
                        </motion.div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 shadow-md mt-6 self-start"
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateEventPage;
