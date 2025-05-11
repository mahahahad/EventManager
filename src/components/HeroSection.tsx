"use client";

import { Button } from "@/components/ui/button"; // Assuming this is your shadcn/ui Button
import { useRouter } from "next/navigation";
import EventsTable from "@/components/EventsTable";
import { ArrowRight } from "lucide-react"; // For an icon in the button
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventData } from "@/types/database";
import FullScreenBackground from "@/components/FullScreenBackground"; // Import the background component
import EventTableSkeleton from "@/components/EventTableSkeleton"; // Import the skeleton component

export default function HeroSection() {
    const router = useRouter();
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            setLoading(true);
            setError(null);
            const today = new Date().toISOString();
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .gte("start_time", today)
                .order("start_time", { ascending: true })
                .limit(3); // Limit the number of events for the hero section

            if (error) {
                console.error("Error fetching upcoming events:", error);
                setError("Failed to fetch events.");
            } else {
                setUpcomingEvents(data || []);
            }
            setLoading(false);
        };

        fetchUpcomingEvents();
    }, []);

    const handleRedirect = () => {
        router.push("/events"); // Or your main events listing page
    };

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG0dby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                darkOverlay={false}
                blur={true}
                animatedGradient={true}
            />
            <div className="relative z-10 flex flex-col items-center space-y-6 sm:space-y-8 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300">
                    Never Miss an Event at{" "}
                    <span className="text-blue-400">42!</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 sm:text-gray-400 max-w-xl">
                    Discover, subscribe, and stay updated on coding workshops,
                    hackathons, and community events tailored for the 42
                    network.
                </p>
                <Button
                    onClick={handleRedirect}
                    className="mt-6 sm:mt-8 !px-8 !py-8 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold
                                        bg-blue-600 hover:bg-blue-500 text-white
                                        rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
                                        transform hover:scale-105 flex items-center gap-2 group"
                >
                    View All Events
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </div>

            {/* Events Table Section with Skeleton Loading */}
            <div className="relative z-10 mt-16 w-full flex justify-center">
                <div className="max-w-screen-lg w-[90%] md:w-[80%] lg:w-[70%]">
                    <h2 className="text-gray-300 text-left font-medium text-md sm:text-xl mb-4 ml-2 sm:ml-0">
                        Upcoming Events
                    </h2>
                    {loading ? (
                        <EventTableSkeleton />
                    ) : (
                        <EventsTable events={upcomingEvents} />
                    )}
                </div>
            </div>
        </section>
    );
}
