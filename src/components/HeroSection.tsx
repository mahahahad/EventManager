"use client";

import { Button } from "@/components/ui/button"; // Assuming this is your shadcn/ui Button
import { useRouter } from "next/navigation";
import EventsTable from "@/components/EventsTable";
import { ArrowRight } from "lucide-react"; // For an icon in the button

export default function HeroSection() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/events"); // Or your main events listing page
    };

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
            {/* Background Visuals - Consider a more abstract or subtle background if the current one feels too busy */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 sm:opacity-30" // Slightly reduced opacity
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
            ></div>
            {/* Enhanced Gradient: Softer transition, potentially to a very dark gray instead of pure black at the bottom to match dashboard themes */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black"></div>

            {/* Animated background elements (Optional - for more dynamism like the inspiration) */}
            {/* You could add subtle animated geometric shapes or particle effects here using CSS animations or a library */}

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center space-y-6 sm:space-y-8 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300">
                    Never Miss an Event at{" "}
                    <span className="text-blue-400">42</span>{" "}
                    {/* Accent color for "42" */}
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 sm:text-gray-400 max-w-xl">
                    Discover, subscribe, and stay updated on coding workshops,
                    hackathons, and community events tailored for the 42
                    network.
                </p>
                <Button
                    onClick={handleRedirect}
                    className="mt-6 sm:mt-8 px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold
                               bg-blue-600 hover:bg-blue-500 text-white
                               rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
                               transform hover:scale-105 flex items-center gap-2 group"
                >
                    View All Events
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </div>

            {/* Events Table Section - Pushed further down, with a clear visual break */}
            <div className="relative z-10 mt-24 sm:mt-32 w-full flex justify-center">
                {/* The EventsTable itself will need styling to match */}
                <EventsTable />
            </div>
        </section>
    );
}
