// src/app/events/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Event as EventType } from "@/types/database";
import { Button } from "@/components/ui/button";
import FullScreenBackground from "@/components/FullScreenBackground";
import { IoArrowBack } from "react-icons/io5"; // Using react-icons for Back button
import {
    CalendarDays,
    Clock,
    MapPin,
    Info,
    Link2,
    Users,
    // Image as ImageIcon, // Can remove if not used directly
    // CheckCircle2, // From previous versions, can remove if not used
    XCircle, // For error state
    Loader2,
    LogIn,
    UserCheck,
    UserX,
    ExternalLink as ExternalLinkIcon, // For external links in footer
} from "lucide-react";
import { motion } from "framer-motion";

// cn utility (ensure it's defined or imported if used elsewhere, or define locally)
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

// Re-using DialogDetailItem structure for consistency
const EventPageDetailItem = ({
    icon: Icon,
    label,
    value,
    children,
}: {
    icon: React.ElementType;
    label: string;
    value?: React.ReactNode;
    children?: React.ReactNode;
}) => (
    <div className="flex items-start space-x-3">
        <Icon className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0 opacity-80" />
        <div>
            <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">
                {label}
            </span>
            {value && (
                <div className="text-gray-100 mt-0.5 text-sm sm:text-base">
                    {value}
                </div>
            )}
            {children && (
                <div className="text-gray-100 mt-0.5 text-sm sm:text-base">
                    {children}
                </div>
            )}
        </div>
    </div>
);

// Skeleton Loader for Event Detail Page - Updated for consistency
const EventDetailSkeleton = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="absolute top-6 left-6">
            <div className="h-10 w-24 bg-gray-700/50 animate-pulse rounded-full" />{" "}
            {/* Back button placeholder */}
        </div>
        <div className="relative bg-black/70 backdrop-blur-2xl shadow-2xl rounded-3xl w-[90%] sm:w-[80%] md:w-[70%] lg:max-w-3xl max-h-[90vh] p-0 border border-gray-700/60 flex flex-col">
            {/* Image Placeholder */}
            <div className="w-full h-48 sm:h-60 md:h-64 bg-gray-700/40 animate-pulse rounded-t-3xl flex-shrink-0"></div>

            {/* Content Placeholder */}
            <div className="p-6 sm:p-8 flex-grow space-y-6 animate-pulse">
                <div className="h-10 w-3/4 bg-gray-600/50 rounded-lg"></div>{" "}
                {/* Title */}
                <div className="space-y-4">
                    <div className="h-6 w-1/2 bg-gray-600/50 rounded"></div>{" "}
                    {/* Detail Item */}
                    <div className="h-6 w-2/3 bg-gray-600/50 rounded"></div>{" "}
                    {/* Detail Item */}
                    <div className="h-6 w-1/2 bg-gray-600/50 rounded"></div>{" "}
                    {/* Detail Item */}
                </div>
                <div className="h-8 w-1/3 bg-gray-600/50 rounded-lg mt-2"></div>{" "}
                {/* Description Title */}
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-full bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-600/50 rounded"></div>
                </div>
            </div>

            {/* Footer Placeholder */}
            <div className="px-6 py-4 bg-black/50 flex-shrink-0 rounded-b-3xl border-t border-gray-700/70">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                    <div className="h-10 w-full sm:w-32 bg-gray-600/50 animate-pulse rounded-full"></div>
                    <div className="h-10 w-full sm:w-36 bg-gray-600/50 animate-pulse rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function EventDetailPage() {
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUnregistering, setIsUnregistering] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const { id: eventId } = useParams<{ id: string }>();
    const router = useRouter();

    useEffect(() => {
        const getCurrentUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUserId(user ? user.id : null); // Set to null if no user
        };
        getCurrentUser();
    }, []);

    useEffect(() => {
        const fetchEventAndRegistrationStatus = async () => {
            if (!eventId) {
                setError("Invalid event ID.");
                setLoading(false);
                return;
            }

            // Don't set loading to true if userId is still undefined (initial load)
            // This avoids a flash of skeleton if user loads quickly
            if (userId !== undefined) setLoading(true);
            setError(null);

            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (eventError) {
                console.error("Error fetching event:", eventError);
                setError("Failed to fetch event details.");
                setEvent(null);
            } else if (eventData) {
                setEvent(eventData as EventType);
            } else {
                setError("Event not found.");
                setEvent(null);
            }

            if (userId && eventData) {
                const { data: regData, error: regError } = await supabase
                    .from("event_registrations")
                    .select("id")
                    .eq("user_id", userId)
                    .eq("event_id", eventId)
                    .maybeSingle();
                if (regError)
                    console.error("Error checking registration:", regError);
                else if (regData) {
                    setIsRegistered(true);
                    setRegistrationId(regData.id);
                } else {
                    setIsRegistered(false);
                    setRegistrationId(null);
                }
            } else {
                setIsRegistered(false);
                setRegistrationId(null);
            }
            setLoading(false);
        };

        // Fetch when eventId is present AND (userId is determined OR it's the initial load without userId yet)
        if (eventId && (userId !== undefined || !loading)) {
            fetchEventAndRegistrationStatus();
        }
    }, [eventId, userId]); // Removed `loading` from deps to avoid re-fetch loops

    const handleGoBack = () => router.back();

    const formatDate = (
        dateString: string | null | undefined,
        options?: Intl.DateTimeFormatOptions
    ) => {
        if (!dateString) return "N/A";
        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Default to 12-hour format
            timeZone: "Asia/Dubai", // Consider making this dynamic or user-configurable
            ...options,
        };
        try {
            return new Date(dateString).toLocaleString("en-US", defaultOptions);
        } catch (e) {
            // en-US for common format, or undefined for locale
            return "Invalid Date";
        }
    };

    const handleRegister = async () => {
        /* ... (remains the same, ensure buttons inside are rounded-full) ... */
        if (!userId) {
            router.push(`/login?redirect=/events/${eventId}`);
            return;
        }
        if (!event || isRegistered) return;
        setIsRegistering(true);
        const { data, error: regError } = await supabase
            .from("event_registrations")
            .insert({ user_id: userId, event_id: event.id })
            .select("id")
            .single();
        if (regError) {
            alert(`Registration failed: ${regError.message}`);
        } else if (data) {
            setIsRegistered(true);
            setRegistrationId(data.id);
            alert("Successfully registered!");
        }
        setIsRegistering(false);
    };
    const handleUnregister = async () => {
        /* ... (remains the same, ensure buttons inside are rounded-full) ... */
        if (!userId || !event || !isRegistered || !registrationId) return;
        setIsUnregistering(true);
        const { error: unregError } = await supabase
            .from("event_registrations")
            .delete()
            .eq("id", registrationId)
            .eq("user_id", userId);
        if (unregError) {
            alert(`Unregistration failed: ${unregError.message}`);
        } else {
            setIsRegistered(false);
            setRegistrationId(null);
            alert("Successfully unregistered.");
        }
        setIsUnregistering(false);
    };

    if (loading && !event) return <EventDetailSkeleton />;

    if (error && !event) {
        /* ... (error display remains the same, ensure buttons rounded-full) ... */
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-white bg-black/70">
                <FullScreenBackground
                    darkOverlay
                    blur
                    imageUrl="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
                />
                <div className="relative p-8 text-center rounded-xl shadow-xl bg-black/50 backdrop-blur-md">
                    <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="mb-2 text-2xl font-semibold">Error</h2>
                    <p className="mb-6 text-lg">{error}</p>
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="text-white border-white hover:bg-white/10 rounded-full"
                    >
                        {" "}
                        {/* rounded-full */}
                        <IoArrowBack
                            size={20}
                            className="inline-block mr-2"
                        />{" "}
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (!event) {
        /* ... (not found display, ensure buttons rounded-full) ... */
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 text-white bg-black/70">
                <FullScreenBackground
                    darkOverlay
                    blur
                    imageUrl="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
                />
                <div className="relative p-8 text-center rounded-xl shadow-xl bg-black/50 backdrop-blur-md">
                    <Info className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h2 className="mb-2 text-2xl font-semibold">
                        Event Not Found
                    </h2>
                    <p className="mb-6 text-lg">
                        The event you are looking for does not exist or could
                        not be loaded.
                    </p>
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="text-white border-white hover:bg-white/10 rounded-full"
                    >
                        {" "}
                        {/* rounded-full */}
                        <IoArrowBack
                            size={20}
                            className="inline-block mr-2"
                        />{" "}
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4">
            {" "}
            {/* Main container for modal-like page */}
            <FullScreenBackground
                darkOverlay
                blur
                imageUrl={
                    event.image_url ||
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
            />
            <Button
                onClick={handleGoBack}
                variant="ghost"
                size="icon"
                className="fixed top-5 left-5 sm:top-6 sm:left-6 z-50 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm border border-white/20 hover:border-white/40"
                aria-label="Go back"
            >
                <IoArrowBack size={20} />
            </Button>
            {/* Main Event Detail Card - Styled like the Info Dialog */}
            <motion.div // Added motion for subtle entrance
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    duration: 0.3,
                }}
                className="relative bg-black/70 backdrop-blur-2xl shadow-2xl rounded-3xl w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700/60"
            >
                {event.image_url && (
                    <div className="w-full h-48 sm:h-60 md:h-72 overflow-hidden flex-shrink-0 rounded-t-3xl">
                        {" "}
                        {/* Match parent rounding */}
                        <img
                            src={event.image_url}
                            alt={event.title || "Event image"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Header part (Title and Metadata) - Not scrollable */}
                <div
                    className={`px-6 pt-6 sm:px-8 sm:pt-8 pb-4 flex-shrink-0 ${
                        !event.image_url ? "rounded-t-3xl" : ""
                    }`}
                >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                        {event.title}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4 pb-4 border-b border-gray-700/40">
                        <EventPageDetailItem
                            icon={CalendarDays}
                            label="Starts"
                            value={formatDate(event.start_time)}
                        />
                        {event.end_time && (
                            <EventPageDetailItem
                                icon={Clock}
                                label="Ends"
                                value={formatDate(event.end_time)}
                            />
                        )}
                        <EventPageDetailItem
                            icon={MapPin}
                            label="Location"
                            value={event.location || "Not specified"}
                        />
                        <EventPageDetailItem
                            icon={Users}
                            label="Visibility"
                            value={
                                event.is_public
                                    ? "Public Event"
                                    : "Private Event"
                            }
                        />
                    </div>
                </div>

                {/* Scrollable Description Area */}
                {event.description && (
                    <div className="px-6 sm:px-8 pb-6 flex-grow overflow-y-auto custom-scrollbar-thin">
                        <h2 className="text-xl font-semibold text-sky-300 mb-2 mt-2">
                            About this event
                        </h2>
                        <p className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                )}
                {!event.description && (
                    <div className="px-6 sm:px-8 pb-6 flex-grow flex items-center justify-center">
                        <p className="text-gray-400 italic">
                            No detailed description available for this event.
                        </p>
                    </div>
                )}

                {/* Action Buttons Footer */}
                <div className="px-6 py-4 bg-black/50 flex-shrink-0 rounded-b-3xl border-t border-gray-700/70">
                    {" "}
                    {/* Match parent rounding, ADDED border-t back for separation */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                        {userId ? (
                            isRegistered ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto p-4 text-green-400 border-green-400 hover:bg-green-400/10 cursor-default flex items-center justify-center rounded-full"
                                        disabled
                                    >
                                        {" "}
                                        {/* rounded-full */}
                                        <UserCheck className="w-5 h-5 mr-2" />{" "}
                                        Registered
                                    </Button>
                                    <Button
                                        onClick={handleUnregister}
                                        disabled={isUnregistering}
                                        variant="destructive"
                                        className="w-full sm:w-auto !p-6 flex items-center justify-center rounded-full"
                                    >
                                        {" "}
                                        {/* rounded-full */}
                                        {isUnregistering ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <UserX className="w-5 h-5 mr-2" />
                                        )}
                                        {isUnregistering
                                            ? "Unregistering..."
                                            : "Unregister"}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={handleRegister}
                                    disabled={isRegistering}
                                    className="w-full sm:w-auto !p-6 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center rounded-full"
                                >
                                    {" "}
                                    {/* rounded-full */}
                                    {isRegistering ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <LogIn className="w-5 h-5 mr-2" />
                                    )}
                                    {isRegistering
                                        ? "Registering..."
                                        : "Register"}
                                </Button>
                            )
                        ) : (
                            <Button
                                onClick={() =>
                                    router.push(
                                        `/login?redirect=/events/${eventId}`
                                    )
                                }
                                className="w-full sm:w-auto bg-gray-500 !p-6 hover:bg-gray-400 text-white flex items-center justify-center rounded-full"
                            >
                                {" "}
                                {/* rounded-full */}
                                <LogIn className="w-5 h-5 mr-2" /> Log In to
                                Register
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
