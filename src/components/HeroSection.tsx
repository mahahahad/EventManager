// components/HeroSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EventCard, { EventCardSkeleton } from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/database";
import FullScreenBackground from "@/components/FullScreenBackground";
import { motion } from 'framer-motion';

export default function HeroSection() {
    const router = useRouter();
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEventForDialog, setSelectedEventForDialog] =
        useState<EventData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Attempt to scroll to top on mount if auto-scroll is an issue
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Check if the page is already at the top to avoid unnecessary scroll if not needed
            if (window.scrollY !== 0) {
                 window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
        }
    }, []); // Empty dependency array, runs once on mount

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            // ... (fetch logic remains the same)
            setLoading(true);
            setError(null);
            const today = new Date().toISOString();
            const { data, error: fetchError } = await supabase
                .from("events")
                .select(`*, event_tags(tags(name))`)
                .gte("start_time", today)
                .order("start_time", { ascending: true })
                .limit(3);

            if (fetchError) {
                let errorMessage = "Oops! We couldn't load upcoming events. Please try refreshing.";
                if (fetchError.message) {
                    errorMessage = `Failed to fetch events: ${fetchError.message}`;
                }
                setError(errorMessage);
            } else {
                setUpcomingEvents(data || []);
            }
            setLoading(false);
        };
        fetchUpcomingEvents();
    }, []);

    const handleRedirectToAllEvents = () => {
        router.push("/events");
    };

    const openEventDialog = (event: EventData) => {
        setSelectedEventForDialog(event);
        setIsDialogOpen(true);
    };

    const fadeInVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (custom: number = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                type: "tween",
                ease: "easeOut",
                duration: 0.6,
                delay: custom * 0.2,
            },
        }),
    };

    return (
        // Ensure this section itself doesn't cause horizontal scroll.
        // overflow-x-hidden here helps clip animations within this section.
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden w-full">
            <FullScreenBackground
            />
            
            <div className="relative z-10 flex flex-col flex-grow-1 items-center space-y-6 sm:space-y-8 max-w-3xl w-full mb-12 md:mb-16"> {/* Added w-full */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-200"
                    variants={fadeInVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    custom={0}
                >
                    Never Miss an Event at <span className="text-blue-400">42!</span>
                </motion.h1>

                <motion.p
                    className="text-lg sm:text-xl text-gray-300 max-w-xl"
                    variants={fadeInVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    custom={1}
                >
                    Discover, subscribe, and stay updated on coding workshops,
                    hackathons, and community events tailored for the 42 network.
                </motion.p>
                
                <motion.div
                    variants={fadeInVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    custom={2}
                >
                    <Button
                        onClick={handleRedirectToAllEvents}
                        className="mt-6 sm:mt-8 !p-8 rounded-full text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2 group"
                    >
                        View All Events
                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                </motion.div>
            </div>

            {/* Upcoming Events Section: Ensure it's also constrained */}
            <div className="relative z-10 w-full flex flex-col items-center max-w-screen-xl mt-4 md:mt-6">
                <motion.h2
                    className="text-gray-100 text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8"
                    variants={fadeInVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    custom={0} 
                >
                    Upcoming Events
                </motion.h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-center w-full max-w-lg mx-auto"> {/* Constrain width */}
                        {error}
                    </div>
                )}
                {loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
                        {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
                    </div>
                )}
                {!loading && !error && upcomingEvents.length > 0 && (
                    // The grid itself should be constrained by its parent max-w-screen-xl
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
                        {upcomingEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                variants={fadeInVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                custom={index * 0.5 + 0.2} // Offset custom delay slightly from H2
                            >
                                <EventCard event={event} onOpenDialog={openEventDialog} />
                            </motion.div>
                        ))}
                    </div>
                )}
                 {!loading && !error && upcomingEvents.length === 0 && (
                     <div className="text-center py-10 px-4 w-full max-w-lg mx-auto"> {/* Constrain width */}
                        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" >
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-medium text-gray-200">No Upcoming Events</h3>
                        <p className="mt-1 text-sm text-gray-400">It looks like things are quiet for now. Check back soon!</p>
                    </div>
                )}
            </div>
            
            <EventDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                event={selectedEventForDialog}
            />
        </section>
    );
}
