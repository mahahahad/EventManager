// src/app/admin/events/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/database"; // Ensure EventData includes event_tags
import { IoArrowBack, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import FullScreenBackground from "@/components/FullScreenBackground";
import { Loader2, AlertCircle, Save } from "lucide-react"; // Added Save icon

// Helper function to format date for datetime-local input
const formatDateTimeLocal = (isoString: string | null | undefined): string => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        // Check if date is valid before formatting
        if (isNaN(date.getTime())) return "";
        // Format to YYYY-MM-DDTHH:mm (datetime-local format)
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
        return ""; // Return empty if parsing fails
    }
};


const AdminEditEventPage = () => {
    const { id: eventId } = useParams<{ id: string }>(); // eventId from route params
    const router = useRouter();

    const [event, setEvent] = useState<EventData | null>(null); // Holds the full event data including tags
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState<string | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState<string | null>("");
    const [description, setDescription] = useState<string | null>("");
    const [isPublic, setIsPublic] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>("");
    const [source, setSource] = useState<string | null>(""); // Editable source
    const [externalId, setExternalId] = useState<number | null>(null);
    const [tagsInput, setTagsInput] = useState<string>(""); // Comma-separated tags

    const [isAdditionalDetailsOpen, setIsAdditionalDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true); // For fetching initial event data
    const [saving, setSaving] = useState(false);   // For update operation
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (eventId) {
                setLoading(true);
                setError(null);
                const { data, error: fetchError } = await supabase
                    .from("events")
                    .select("*, event_tags(tags(id, name))") // Fetch event with its related tags
                    .eq("id", eventId)
                    .single();

                if (fetchError) {
                    console.error("Failed to fetch event:", fetchError);
                    setError("Failed to fetch event details.");
                    setEvent(null);
                } else if (data) {
                    setEvent(data as EventData);
                    setTitle(data.title);
                    setLocation(data.location || "");
                    setStartTime(formatDateTimeLocal(data.start_time));
                    setEndTime(formatDateTimeLocal(data.end_time));
                    setDescription(data.description || "");
                    setIsPublic(data.is_public);
                    setImageUrl(data.image_url || "");
                    setSource(data.source || "");
                    setExternalId(data.external_id || null);
                    // Populate tagsInput from fetched event_tags
                    const currentTags = data.event_tags?.map((et: any) => et.tags?.name).filter(Boolean) || [];
                    setTagsInput(currentTags.join(", "));
                } else {
                    setError("Event not found.");
                    setEvent(null);
                }
                setLoading(false);
            } else {
                setError("No event ID provided.");
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId || !event) {
            setError("Event data is missing, cannot update.");
            return;
        }
        setSaving(true);
        setError(null);

        // Basic validation
        if (!title.trim() || !startTime.trim()) {
            setError("Title and Start Time are required.");
            setSaving(false);
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from("events")
                .update({
                    title: title.trim(),
                    location: location ? location.trim() : null,
                    start_time: new Date(startTime).toISOString(), // Ensure ISO format for DB
                    end_time: endTime ? new Date(endTime).toISOString() : null,
                    description: description ? description.trim() : null,
                    is_public: isPublic,
                    image_url: imageUrl ? imageUrl.trim() : null,
                    source: source ? source.trim() : event.source, // Use existing if not changed
                    external_id: externalId,
                    updated_at: new Date().toISOString(), // Always set updated_at
                })
                .eq("id", eventId);

            if (updateError) throw updateError;

            // --- Handle Tags Update ---
            // 1. Delete existing event_tags for this event
            const { error: deleteTagsError } = await supabase
                .from("event_tags")
                .delete()
                .eq("event_id", eventId);
            if (deleteTagsError) console.warn("Could not clear old tags, proceeding:", deleteTagsError); // Non-critical for this flow

            // 2. Process and link new tags
            if (tagsInput.trim() !== "") {
                const tagNames = tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0 && tag.length <= 50);
                if (tagNames.length > 0) {
                    const { data: upsertedTags, error: tagsError } = await supabase
                        .from("tags")
                        .upsert(tagNames.map(name => ({ name })), { onConflict: 'name' })
                        .select("id, name");

                    if (tagsError) throw tagsError;

                    if (upsertedTags && upsertedTags.length > 0) {
                        const eventTagLinks = upsertedTags.map(tag => ({
                            event_id: eventId,
                            tag_id: tag.id,
                        }));
                        const { error: eventTagsError } = await supabase.from("event_tags").insert(eventTagLinks);
                        if (eventTagsError) throw eventTagsError;
                    }
                }
            }
            // --- End Handle Tags Update ---
            router.push("/admin/events?status=updated_successfully");
        } catch (err: any) {
            console.error("Error updating event:", err);
            setError(`Failed to update event: ${err.message || "An unexpected error occurred."}`);
        } finally {
            setSaving(false);
        }
    };
    
    const inputClassName = "mt-1.5 bg-neutral-800/60 text-gray-100 border-gray-600/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg !py-3 !px-4 placeholder-gray-500";
    const labelClassName = "block text-sm font-medium text-gray-300 mb-1";


    if (loading) {
        return (
            <div className="relative min-h-screen text-white flex items-center justify-center">
                <FullScreenBackground />
                <Loader2 className="w-12 h-12 animate-spin text-sky-400" />
                <p className="ml-4 text-xl">Loading event details...</p>
            </div>
        );
    }

    if (error && !event) { // Show full page error if event couldn't be fetched at all
        return (
            <div className="relative min-h-screen text-white">
                <FullScreenBackground />
                <div className="relative z-10 pt-24 pb-32 px-4 flex flex-col items-center justify-center min-h-screen">
                    <div className="w-full max-w-md bg-black/70 backdrop-blur-xl p-8 rounded-3xl border border-red-700/50 shadow-2xl text-center">
                        <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-semibold text-red-300 mb-2">Error Fetching Event</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <Button onClick={() => router.push('/admin/events')} variant="outline" className="!p-4 rounded-full text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white">
                            Back to Events
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!event) { // Should be caught by error state, but as a fallback
        return <div className="relative min-h-screen text-white flex items-center justify-center"><FullScreenBackground /><p>Event not found or could not be loaded.</p></div>;
    }


    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground />
            <div className="relative z-10 pt-24 pb-32 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-start min-h-screen">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
                    className="w-full max-w-2xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-700/50 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 truncate pr-4" title={title}>
                            Edit: {title.length > 30 ? `${title.substring(0,27)}...` : title }
                        </h1>
                        <Button onClick={() => router.back()} variant="outline" className="!p-4 rounded-full text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2 flex-shrink-0">
                            <IoArrowBack size={18} /> Back
                        </Button>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
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

                        <div className="pt-2"> {/* Additional Options Section */}
                            <Button type="button" onClick={() => setIsAdditionalDetailsOpen(!isAdditionalDetailsOpen)} variant="ghost" className="w-full !justify-start text-sky-400 hover:text-sky-300 hover:bg-sky-800/20 !p-3 rounded-lg flex items-center text-sm font-medium">
                                Additional Options
                                <motion.span className="ml-auto" initial={false} animate={isAdditionalDetailsOpen ? "open" : "closed"} variants={{ open: { rotate: 180 }, closed: { rotate: 0 } }}>
                                    {isAdditionalDetailsOpen ? <IoChevronUp /> : <IoChevronDown /> }
                                </motion.span>
                            </Button>
                            <AnimatePresence initial={false}>
                                {isAdditionalDetailsOpen && (
                                    <motion.div
                                        key="additional-details-content" initial="collapsed" animate="open" exit="collapsed"
                                        variants={{ open: { opacity: 1, height: "auto", marginTop: "1.5rem" }, collapsed: { opacity: 0, height: 0, marginTop: 0 } }}
                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden space-y-6"
                                    >
                                        <div>
                                            <Label htmlFor="source" className={labelClassName}>Source</Label>
                                            <Input id="source" value={source || ""} onChange={(e) => setSource(e.target.value)} placeholder="e.g., manual_admin, intra_42" className={inputClassName} />
                                        </div>
                                        <div>
                                            <Label htmlFor="externalId" className={labelClassName}>External ID (Optional)</Label>
                                            <Input id="externalId" type="number" value={externalId === null ? "" : String(externalId)} onChange={(e) => setExternalId(e.target.value === "" ? null : parseInt(e.target.value, 10))} className={inputClassName} placeholder="e.g., Intra ID if applicable"/>
                                        </div>
                                        <div>
                                            <Label htmlFor="tagsInput" className={labelClassName}>Tags (comma-separated)</Label>
                                            <Input id="tagsInput" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClassName} placeholder="e.g., workshop, AI, python"/>
                                        </div>
                                        <div className="flex items-center space-x-3 pt-2">
                                            <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checkedState) => setIsPublic(checkedState === true)} className="border-gray-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-600 w-5 h-5 rounded" />
                                            <Label htmlFor="isPublic" className="text-gray-300 text-sm font-medium cursor-pointer">Make this event publicly visible</Label>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-700/50">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={saving} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold !p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/30 mt-8 flex items-center justify-center gap-2">
                            {saving && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {saving ? "Saving Changes..." : <><Save className="w-5 h-5 mr-2" /> Update Event</>}
                        </Button>
                    </form>
                </motion.div>
            </div>
            <AdminNavbar />
        </div>
    );
};

export default AdminEditEventPage;
