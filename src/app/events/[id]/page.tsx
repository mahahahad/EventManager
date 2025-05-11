// src/app/events/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Event as EventType } from "@/types/database";
import { Button } from "@/components/ui/button";
import FullScreenBackground from "@/components/FullScreenBackground";
import { IoArrowBack } from "react-icons/io5";
import {
    CalendarDays,
    Clock,
    MapPin,
    Info,
    Link2,
    Users,
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    Loader2,
    LogIn,
    UserCheck,
    UserX, // For Unregister button
} from "lucide-react";

// Helper to cn function if not globally available
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

// Skeleton Loader for Event Detail Page
const EventDetailSkeleton = () => (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4 z-40">
         <div className="absolute top-4 left-4">
            <div className="h-10 w-24 bg-gray-700/50 animate-pulse rounded-full" />
        </div>
        <div className="relative bg-black/40 backdrop-blur-xl shadow-2xl rounded-[32px] w-[90%] md:w-[80%] lg:w-[70%] h-auto max-h-[90vh] overflow-y-auto p-6 sm:p-8 md:p-10 border border-gray-700/50">
            <div className="animate-pulse space-y-6 mt-8">
                <div className="h-8 w-3/4 bg-gray-600/50 rounded"></div> {/* Title */}
                <div className="space-y-3">
                    <div className="h-5 w-1/2 bg-gray-600/50 rounded"></div> {/* Location */}
                    <div className="h-5 w-2/3 bg-gray-600/50 rounded"></div> {/* Start Time */}
                    <div className="h-5 w-2/3 bg-gray-600/50 rounded"></div> {/* End Time */}
                </div>
                <div className="h-20 w-full bg-gray-600/50 rounded"></div> {/* Description */}
                <div className="h-48 w-full bg-gray-600/50 rounded"></div> {/* Image */}
                <div className="h-10 w-1/3 bg-gray-600/50 rounded self-center_ mt-4"></div> {/* Register Button */}
            </div>
        </div>
    </div>
);


export default function EventDetailPage() {
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null); // To store the ID of the registration for unregistering
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUnregistering, setIsUnregistering] = useState(false); // New state
    const [userId, setUserId] = useState<string | null>(null);

    const { id: eventId } = useParams<{ id: string }>();
    const router = useRouter();

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
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

            setLoading(true);
            setError(null);

            // Fetch event details
            const { data: eventData, error: eventError } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (eventError) {
                console.error("Error fetching event:", eventError);
                setError("Failed to fetch event details. It might not exist or there was a network issue.");
                setEvent(null);
            } else if (eventData) {
                setEvent(eventData as EventType);
            } else {
                setError("Event not found.");
                setEvent(null);
            }

            // Check registration status if user is logged in
            if (userId && eventData) {
                const { data: registrationData, error: registrationError } = await supabase
                    .from("event_registrations")
                    .select("id") // Fetch the registration ID
                    .eq("user_id", userId)
                    .eq("event_id", eventId)
                    .maybeSingle();

                if (registrationError) {
                    console.error("Error checking registration status:", registrationError);
                } else if (registrationData) {
                    setIsRegistered(true);
                    setRegistrationId(registrationData.id); // Store registration ID
                } else {
                    setIsRegistered(false);
                    setRegistrationId(null);
                }
            } else {
                 setIsRegistered(false); // Ensure these are reset if no userId or eventData
                 setRegistrationId(null);
            }
            setLoading(false);
        };

        // Only fetch if userId is available (or determined to be null for anonymous users)
        // This prevents an unnecessary fetch cycle while userId is still being determined.
        if (userId !== undefined) { // userId starts as null, then string, or stays null
            fetchEventAndRegistrationStatus();
        } else if (!userId && !loading && eventId) { // Case where user is not logged in, but we have eventId
             fetchEventAndRegistrationStatus(); // Fetch event details anyway
        }

    }, [eventId, userId, loading]); // `loading` in dependency array to re-check if initial user fetch was pending

    const handleGoBack = () => {
        router.back();
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString("en-AE", {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
                timeZone: "Asia/Dubai",
            });
        } catch (e) {
            return "Invalid Date";
        }
    };

    const handleRegister = async () => {
        if (!userId) {
            alert("Please log in to register for events.");
            router.push(`/login?redirect=/events/${eventId}`);
            return;
        }
        if (!event || isRegistered) return;

        setIsRegistering(true);
        const { data, error: registrationError } = await supabase
            .from("event_registrations")
            .insert({
                user_id: userId,
                event_id: event.id,
            })
            .select('id') // Select the ID of the new registration
            .single();

        if (registrationError) {
            console.error("Error registering for event:", registrationError);
            alert(`Registration failed: ${registrationError.message}`);
        } else if (data) {
            setIsRegistered(true);
            setRegistrationId(data.id); // Store the new registration ID
            alert("Successfully registered for the event!");
        }
        setIsRegistering(false);
    };

    const handleUnregister = async () => {
        if (!userId || !event || !isRegistered || !registrationId) return;

        setIsUnregistering(true);
        const { error: unregistrationError } = await supabase
            .from("event_registrations")
            .delete()
            .eq("id", registrationId) // Use the specific registration ID
            .eq("user_id", userId);   // Extra safety: ensure it's this user's registration

        if (unregistrationError) {
            console.error("Error unregistering from event:", unregistrationError);
            alert(`Unregistration failed: ${unregistrationError.message}`);
        } else {
            setIsRegistered(false);
            setRegistrationId(null);
            alert("Successfully unregistered from the event.");
        }
        setIsUnregistering(false);
    };


    if (loading && !event) { // Show skeleton only if event data is not yet available
        return <EventDetailSkeleton />;
    }

    if (error && !event) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center p-4 text-white z-50">
                <FullScreenBackground darkOverlay blur imageUrl="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" />
                <div className="relative text-center bg-black/50 backdrop-blur-md p-8 rounded-xl shadow-xl">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Error</h2>
                    <p className="text-lg mb-6">{error}</p>
                    <Button onClick={handleGoBack} variant="outline" className="text-white border-white hover:bg-white/10">
                        <IoArrowBack size={20} className="inline-block mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }
    
    if (!event) {
         return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col justify-center items-center p-4 text-white z-50">
                <FullScreenBackground darkOverlay blur imageUrl="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" />
                 <div className="relative text-center bg-black/50 backdrop-blur-md p-8 rounded-xl shadow-xl">
                    <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
                    <p className="text-lg mb-6">The event you are looking for does not exist or could not be loaded.</p>
                     <Button onClick={handleGoBack} variant="outline" className="text-white border-white hover:bg-white/10">
                        <IoArrowBack size={20} className="inline-block mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
        <div className="flex items-start space-x-3 mb-3 text-sm sm:text-base">
            <Icon className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
            <div>
                <span className="font-semibold text-gray-300">{label}:</span>
                <span className="ml-2 text-gray-100 break-words">{value || "N/A"}</span>
            </div>
        </div>
    );

    return (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center p-2 sm:p-4 z-40">
            <FullScreenBackground darkOverlay blur imageUrl={event.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} />
            
            <button
                onClick={handleGoBack}
                className="fixed top-4 left-4 bg-black/50 hover:bg-black/70 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-150 z-50 flex items-center backdrop-blur-sm border border-white/20 hover:border-white/40"
                aria-label="Go back"
            >
                <IoArrowBack size={18} className="inline-block mr-1.5" /> Back
            </button>

            {/* Modal-like Card */}
            <div className="relative bg-black/60 backdrop-blur-2xl shadow-2xl rounded-[24px] sm:rounded-[32px] w-[95%] md:w-[85%] lg:w-[70%] xl:w-[60%] h-auto max-h-[90vh] /* Removed overflow-hidden here to allow description to scroll */ flex flex-col border border-gray-700/60">
                {event.image_url && (
                    <div className="w-full h-48 sm:h-64 md:h-72 overflow-hidden flex-shrink-0"> {/* Added flex-shrink-0 */}
                        <img
                            src={event.image_url}
                            alt={event.title || "Event image"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                {/* This div will contain all content that might need to scroll if image is not present, or just general content area */}
                <div className="p-5 sm:p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar"> {/* Content area that scrolls if needed (excluding fixed footer) */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                        {event.title}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-6">
                        <DetailItem icon={MapPin} label="Location" value={event.location} />
                        <DetailItem icon={CalendarDays} label="Start Time" value={formatDate(event.start_time)} />
                        {event.end_time && <DetailItem icon={Clock} label="End Time" value={formatDate(event.end_time)} />}
                        <DetailItem icon={Users} label="Public" value={event.is_public ? "Yes" : "No"} />
                        {event.source && <DetailItem icon={Link2} label="Source" value={event.source} />}
                        {event.external_id && <DetailItem icon={Info} label="External ID" value={event.external_id} />}
                    </div>

                    {event.description && (
                        <div className="mt-4 mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-300 flex items-center">
                                <Info className="w-5 h-5 mr-2" /> Description
                            </h2>
                            {/* This div will handle the scrolling for the description */}
                            <div className="max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-2"> {/* Added pr-2 for scrollbar space */}
                                <p className="text-gray-200 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Action Buttons Footer - this should NOT scroll with the content above */}
                <div className="px-5 sm:px-6 md:px-8 py-4 border-t border-gray-700/80 bg-black/40 flex-shrink-0"> {/* Added flex-shrink-0 and changed bg */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                        {userId ? (
                            isRegistered ? (
                                <>
                                    <Button variant="outline" className="w-full sm:w-auto text-green-400 border-green-400 hover:bg-green-400/10 cursor-default flex items-center justify-center" disabled>
                                        <UserCheck className="w-5 h-5 mr-2" /> Already Registered
                                    </Button>
                                    <Button 
                                        onClick={handleUnregister} 
                                        disabled={isUnregistering} 
                                        variant="destructive"
                                        className="w-full sm:w-auto flex items-center justify-center"
                                    >
                                        {isUnregistering ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<UserX className="w-5 h-5 mr-2" />)}
                                        {isUnregistering ? "Unregistering..." : "Unregister"}
                                    </Button>
                                </>
                            ) : (
                                <Button 
                                    onClick={handleRegister} 
                                    disabled={isRegistering} 
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center sm:ml-auto"
                                >
                                    {isRegistering ? (<Loader2 className="w-5 h-5 mr-2 animate-spin" />) : (<LogIn className="w-5 h-5 mr-2" />)}
                                    {isRegistering ? "Registering..." : "Register for Event"}
                                </Button>
                            )
                        ) : (
                            <Button 
                                onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
                                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-400 text-white flex items-center justify-center sm:ml-auto"
                            >
                                <LogIn className="w-5 h-5 mr-2" /> Log In to Register
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
