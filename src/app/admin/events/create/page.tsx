// src/app/admin/events/create/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // Removed useCallback as it wasn't used
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IoArrowBack, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FullScreenBackground from "@/components/FullScreenBackground";
import { Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle for errors
import { cn } from "@/lib/utils";

const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};

const AdminCreateEventPage = () => {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>("");
    const [isPublic, setIsPublic] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>("");
    // const [source, setSource] = useState<string | null>("manual"); // Source removed from form
    const [externalId, setExternalId] = useState<number | null>(null);
    const [tagsInput, setTagsInput] = useState<string>("");

    const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            setError("Authentication error. Please ensure you are logged in.");
            setLoading(false);
            return;
        }

        if (!title.trim() || !startTime.trim()) {
            setError("Title and Start Time are mandatory fields.");
            setLoading(false);
            return;
        }

        try {
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .insert([
                    {
                        title: title.trim(),
                        location: location ? location.trim() : null,
                        start_time: startTime,
                        end_time: endTime || null,
                        description: description ? description.trim() : null,
                        is_public: isPublic,
                        image_url: imageUrl ? imageUrl.trim() : null,
                        source: "manual_admin", // Set source automatically
                        external_id: externalId,
                        created_by: currentUserId,
                    },
                ])
                .select("id") // Only select the ID
                .single();

            if (eventError) throw eventError;

            if (eventData && tagsInput.trim() !== "") {
                const tagNames = tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0 && tag.length <= 50); // Added length validation
                if (tagNames.length > 0) {
                    const { data: upsertedTags, error: tagsError } = await supabase
                        .from("tags")
                        .upsert(tagNames.map(name => ({ name })), { onConflict: 'name' })
                        .select("id, name");

                    if (tagsError) throw tagsError;

                    if (upsertedTags && upsertedTags.length > 0) {
                        const eventTagLinks = upsertedTags.map(tag => ({
                            event_id: eventData.id,
                            tag_id: tag.id,
                        }));
                        const { error: eventTagsError } = await supabase.from("event_tags").insert(eventTagLinks);
                        if (eventTagsError) throw eventTagsError;
                    }
                }
            }
            router.push("/admin/events?status=created_successfully");
        } catch (err: any) {
            console.error("Error creating event:", err);
            setError(`Failed to create event: ${err.message || "An unexpected error occurred."}`);
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = "mt-1.5 bg-neutral-800/60 text-gray-100 border-gray-600/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg !py-3 !px-4 placeholder-gray-500";
    const labelClassName = "block text-sm font-medium text-gray-300 mb-1";


    return (
        // Root div no longer has bg-black, relies on FullScreenBackground
        <div className="relative min-h-screen text-white">
            <FullScreenBackground /> {/* No props, uses defaults */}
            
            <div className="relative z-10 pt-24 pb-32 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-start min-h-screen"> {/* Added min-h-screen here for centering content if page is short */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
                    // Main content card, inspired by EventDialog
                    className="w-full max-w-2xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-700/60 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100"> {/* Removed gradient */}
                            Create New Event
                        </h1>
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="!p-4 rounded-full text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <IoArrowBack size={18} />
                            Back
                        </Button>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="title" className={labelClassName}>Title <span className="text-red-500">*</span></Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClassName} placeholder="Event Title"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <div>
                                <Label htmlFor="location" className={labelClassName}>Location</Label>
                                <Input id="location" value={location || ""} onChange={(e) => setLocation(e.target.value)} className={inputClassName} placeholder="e.g., Main Hall, Online"/>
                            </div>
                            <div>
                                <Label htmlFor="imageUrl" className={labelClassName}>Image URL</Label>
                                <Input id="imageUrl" type="url" value={imageUrl || ""} onChange={(e) => setImageUrl(e.target.value)} className={inputClassName} placeholder="https://example.com/image.png"/>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <div>
                                <Label htmlFor="startTime" className={labelClassName}>Start Time <span className="text-red-500">*</span></Label>
                                <Input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={inputClassName} />
                            </div>
                            <div>
                                <Label htmlFor="endTime" className={labelClassName}>End Time</Label>
                                <Input type="datetime-local" id="endTime" value={endTime || ""} onChange={(e) => setEndTime(e.target.value)} className={inputClassName} />
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="description" className={labelClassName}>Description</Label>
                            <Textarea id="description" value={description || ""} onChange={(e) => setDescription(e.target.value)} className={cn(inputClassName, "min-h-[120px]")} placeholder="Detailed information about the event..."/>
                        </div>

                        {/* Additional Options Section */}
                        <div className="pt-2">
                            <Button
                                type="button"
                                onClick={() => setIsAdditionalDetailsOpen(!isAdditionalDetailsOpen)}
                                variant="ghost" // More subtle toggle
                                className="w-full !justify-start text-sky-400 hover:text-sky-300 hover:bg-sky-800/20 !p-3 rounded-lg flex items-center text-sm font-medium"
                            >
                                Additional Options
                                <motion.span className="ml-auto" initial={false} animate={isAdditionalDetailsOpen ? "open" : "closed"} variants={{ open: { rotate: 180 }, closed: { rotate: 0 } }}>
                                    <IoChevronDown />
                                </motion.span>
                            </Button>

                            <AnimatePresence initial={false}>
                                {isAdditionalDetailsOpen && (
                                    <motion.div
                                        key="additional-details-content"
                                        initial="collapsed"
                                        animate="open"
                                        exit="collapsed"
                                        variants={{
                                            open: { opacity: 1, height: "auto", marginTop: "1.5rem" },
                                            collapsed: { opacity: 0, height: 0, marginTop: 0 }
                                        }}
                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }} // Smoother ease
                                        className="overflow-hidden space-y-6"
                                    >
                                        {/* External ID */}
                                        <div>
                                            <Label htmlFor="externalId" className={labelClassName}>External ID (Optional)</Label>
                                            <Input id="externalId" type="number" value={externalId === null ? "" : String(externalId)} onChange={(e) => setExternalId(e.target.value === "" ? null : parseInt(e.target.value, 10))} className={inputClassName} placeholder="e.g., Intra ID if applicable"/>
                                        </div>

                                        {/* Tags Input */}
                                        <div>
                                            <Label htmlFor="tagsInput" className={labelClassName}>Tags (comma-separated)</Label>
                                            <Input id="tagsInput" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClassName} placeholder="e.g., workshop, AI, python"/>
                                        </div>
                                        
                                        {/* Is Public Checkbox */}
                                        <div className="flex items-center space-x-3 pt-2">
                                            <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checkedState) => setIsPublic(checkedState === true)} className="border-gray-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-600 w-5 h-5 rounded" />
                                            <Label htmlFor="isPublic" className="text-gray-300 text-sm font-medium cursor-pointer">
                                                Make this event publicly visible
                                            </Label>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-700/50">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            // Solid fill button, consistent padding and rounding
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold !p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/30 mt-8 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {loading ? "Creating Event..." : "Create Event"}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminCreateEventPage;
