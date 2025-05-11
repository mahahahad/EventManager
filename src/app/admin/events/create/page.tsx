"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IoArrowBack, IoChevronDown } from "react-icons/io5";
import { motion } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FullScreenBackground from "@/components/FullScreenBackground";

const AdminCreateEventPage = () => {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>("");
    const [isPublic, setIsPublic] = useState(true);
    const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] =
        useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>("");
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.from("events").insert([
            {
                title,
                location,
                start_time: startTime,
                end_time: endTime,
                description,
                is_public: isPublic,
                image_url: imageUrl,
            },
        ]);

        setLoading(false);

        if (error) {
            setError("Failed to create event.");
        } else {
            router.push("/admin/events");
        }
    };

    const additionalOptionsVariants = {
        open: {
            height: "auto",
            opacity: 1,
            marginTop: "1rem",
            transition: { duration: 0.3 },
        },
        closed: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            transition: { duration: 0.2 },
        },
    };

    const chevronVariants = {
        open: { rotate: 180 },
        closed: { rotate: 0 },
    };

    return (
        <div className="relative min-h-screen">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1495435286966-9b1f1b585328"
                animatedGradient
                blur
                darkOverlay
            />
            <div className="absolute inset-0 pt-20 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start z-10">
                <AdminNavbar />
                <div className="max-w-4xl w-full mt-16 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Create Event
                        </h1>
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="text-white border-gray-600 hover:bg-white/10 transition"
                        >
                            <IoArrowBack className="mr-2" />
                            Back
                        </Button>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-black/50 p-6 rounded-3xl border border-gray-700 shadow-lg space-y-5"
                    >
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 bg-neutral-800 text-white border-gray-600"
                            />
                        </div>

                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={location || ""}
                                onChange={(e) => setLocation(e.target.value)}
                                className="mt-1 bg-neutral-800 text-white border-gray-600"
                            />
                        </div>

                        <div>
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                type="datetime-local"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="mt-1 bg-neutral-800 text-white border-gray-600"
                            />
                        </div>

                        <div>
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                type="datetime-local"
                                id="endTime"
                                value={endTime || ""}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="mt-1 bg-neutral-800 text-white border-gray-600"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description || ""}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 bg-neutral-800 text-white border-gray-600"
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={() =>
                                setIsAdditionalDetailsOpen(
                                    !isAdditionalDetailsOpen
                                )
                            }
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 flex items-center"
                        >
                            Additional Options
                            <motion.span
                                className="ml-2"
                                variants={chevronVariants}
                                animate={
                                    isAdditionalDetailsOpen ? "open" : "closed"
                                }
                            >
                                <IoChevronDown />
                            </motion.span>
                        </Button>

                        <motion.div
                            variants={additionalOptionsVariants}
                            initial="closed"
                            animate={
                                isAdditionalDetailsOpen ? "open" : "closed"
                            }
                            className="overflow-hidden"
                        >
                            <div>
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    type="url"
                                    value={imageUrl || ""}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
                                    className="mt-1 bg-neutral-800 text-white border-gray-600"
                                />
                            </div>
                            <div className="flex items-center space-x-2 mt-4">
                                <Checkbox
                                    id="isPublic"
                                    checked={isPublic}
                                    onCheckedChange={(checked) =>
                                        setIsPublic(!!checked)
                                    }
                                />
                                <Label htmlFor="isPublic">Public Event</Label>
                            </div>
                        </motion.div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 shadow-md mt-6"
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </Button>

                        {error && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateEventPage;
