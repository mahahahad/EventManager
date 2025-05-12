// src/app/events/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Event as EventType } from "@/types/database"; // Ensure EventType includes event_tags
import { Button } from "@/components/ui/button";
import FullScreenBackground from "@/components/FullScreenBackground";
import { IoArrowBack } from "react-icons/io5";
import {
    CalendarDays,
    Clock,
    MapPin,
    Info,
    Users,
    Tag as TagIcon, // Added for tags
    XCircle,
    Loader2,
    LogIn,
    UserCheck,
    UserX,
    ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { motion } from "framer-motion";

// cn utility (if not globally available)
// function cn(...classes: string[]) {
//     return classes.filter(Boolean).join(" ");
// }

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
        <Icon className="w-5 h-5 text-sky-400 mt-1 flex-shrink-0 opacity-90" />{" "}
        {/* Slightly larger icon */}
        <div>
            <span className="font-semibold text-gray-300 text-xs uppercase tracking-wider">
                {" "}
                {/* Slightly bolder label */}
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

const EventDetailSkeleton = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
            <div className="h-10 w-10 bg-gray-700/50 animate-pulse rounded-full" />{" "}
            {/* Back button placeholder */}
        </div>
        <div className="relative bg-black/50 backdrop-blur-xl shadow-2xl rounded-3xl w-[90%] sm:w-[80%] md:w-[70%] lg:max-w-4xl max-h-[90vh] p-0 border border-gray-700/50 flex flex-col">
            <div className="w-full h-48 sm:h-60 md:h-72 bg-gray-700/40 animate-pulse rounded-t-3xl flex-shrink-0"></div>
            <div className="p-6 sm:p-8 flex-grow space-y-6 animate-pulse">
                <div className="h-10 w-3/4 bg-gray-600/50 rounded-lg mb-4"></div>{" "}
                {/* Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    {" "}
                    {/* For metadata */}
                    {[...Array(4)].map(
                        (
                            _,
                            i // Assuming up to 4 metadata items (date, time, loc, tags)
                        ) => (
                            <div key={i} className="space-y-1">
                                <div className="h-4 w-1/3 bg-gray-600/40 rounded"></div>{" "}
                                {/* Label */}
                                <div className="h-5 w-2/3 bg-gray-600/50 rounded"></div>{" "}
                                {/* Value */}
                            </div>
                        )
                    )}
                </div>
                <div className="h-6 w-1/3 bg-gray-600/50 rounded-lg mt-4"></div>{" "}
                {/* Description Title */}
                <div className="space-y-2 mt-1">
                    <div className="h-4 w-full bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-full bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-600/50 rounded"></div>
                </div>
            </div>
            <div className="px-6 py-4 bg-black/40 flex-shrink-0 rounded-b-3xl">
                {" "}
                {/* Footer, no border-t */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                    <div className="h-12 w-full sm:w-36 bg-gray-600/50 animate-pulse rounded-full"></div>
                    <div className="h-12 w-full sm:w-40 bg-gray-600/50 animate-pulse rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function EventDetailPage() {
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    // ... (other states: error, isRegistered, registrationId, isRegistering, isUnregistering, userId)
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
            /* ... same ... */
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUserId(user ? user.id : null);
        };
        getCurrentUser();
    }, []);

    useEffect(() => {
        const fetchEventAndRegistrationStatus = async () => {
            if (!eventId) {
                /* ... same error handling ... */
                setError("Invalid event ID.");
                setLoading(false);
                return;
            }
            if (userId !== undefined) setLoading(true); // Only set loading if userId is determined
            setError(null);

            // Fetch event including event_tags and nested tags
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*, event_tags(tags(name))") // Ensure tags are fetched
                .eq("id", eventId)
                .single();

            if (eventError) {
                /* ... same event error handling ... */
                console.error("Error fetching event:", eventError);
                setError("Failed to fetch event details.");
                setEvent(null);
            } else if (eventData) {
                setEvent(eventData as EventType); // Type assertion
            } else {
                setError("Event not found.");
                setEvent(null);
            }

            // Registration status check
            if (userId && eventData) {
                /* ... same registration check ... */
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

        if (eventId && userId !== undefined) {
            // Fetch only when both eventId and userId status are known
            fetchEventAndRegistrationStatus();
        }
    }, [eventId, userId]);

    const handleGoBack = () => router.back();

    const formatDate = (
        dateString: string | null | undefined,
        options?: Intl.DateTimeFormatOptions
    ) => {
        /* ... same ... */
        if (!dateString) return "N/A";
        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            // timeZone: "Asia/Dubai", // Consider removing or making configurable
            ...options,
        };
        try {
            return new Date(dateString).toLocaleString(
                undefined,
                defaultOptions
            ); // Use undefined for user's locale
        } catch (e) {
            return "Invalid Date";
        }
    };

    const handleRegister = async () => {
        /* ... same logic ... */
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
        /* ... same logic ... */
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
        return (
            /* ... same error display structure ... */
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
                        className="text-white border-white hover:bg-white/10 !p-5 rounded-full"
                    >
                        {" "}
                        {/* !p-5 rounded-full */}
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
        return (
            /* ... same "Event Not Found" display structure ... */
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
                        className="text-white border-white hover:bg-white/10 !p-5 rounded-full"
                    >
                        {" "}
                        {/* !p-5 rounded-full */}
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
            <FullScreenBackground />
            <Button
                onClick={handleGoBack}
                variant="ghost"
                size="icon"
                className="fixed top-5 left-5 sm:top-6 sm:left-6 z-50 h-11 w-11 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm border border-white/20 hover:border-white/40 flex items-center justify-center" // Ensure icon centered, adjusted size
                aria-label="Go back"
            >
                <IoArrowBack size={22} />
            </Button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    duration: 0.4,
                }}
                className="relative bg-black/50 backdrop-blur-xl shadow-2xl rounded-3xl w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700/50" // Main card style
            >
                {event.image_url && (
                    <div className="w-full h-48 sm:h-60 md:h-72 overflow-hidden flex-shrink-0 rounded-t-3xl">
                        <img
                            src={event.image_url}
                            alt={event.title || "Event image"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

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

                        {/* Display Tags */}
                        {event.event_tags && event.event_tags.length > 0 && (
                            <EventPageDetailItem icon={TagIcon} label="Tags">
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {event.event_tags.map((et, index) =>
                                        et.tags && et.tags.name ? (
                                            <span
                                                key={index}
                                                className="text-xs bg-purple-600/40 text-purple-200 px-2.5 py-1 rounded-full"
                                            >
                                                {et.tags.name}
                                            </span>
                                        ) : null
                                    )}
                                </div>
                            </EventPageDetailItem>
                        )}
                    </div>
                </div>

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
                {!event.description && "No descrpition provided."}

                <div className="px-6 py-4 bg-black/40 backdrop-blur-sm flex-shrink-0 rounded-b-3xl">
                    {" "}
                    {/* Removed border-t */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                        {/* Intra Link Button - Added Here */}
                        {event.external_id && event.source === "intra_42" && (
                            <Button // No extra characters around this or its child
                                asChild
                                className="w-full sm:w-auto !p-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full"
                            >
                                <a // Single direct child
                                    href={`https://intra.42.fr/events/${event.external_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5"
                                >
                                    View on Intra <ExternalLinkIcon size={16} />
                                </a>
                            </Button>
                        )}

                        {userId ? (
                            isRegistered ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto !p-6 text-green-400 border-green-400 hover:bg-green-400/10 cursor-default flex items-center justify-center rounded-full"
                                        disabled
                                    >
                                        {" "}
                                        {/* !p-4 rounded-full */}
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
                                        {/* !p-5 rounded-full */}
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
                                    {/* !p-6 rounded-full */}
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
                                {/* !p-6 rounded-full */}
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
