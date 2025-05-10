"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EventsTable from "@/components/EventsTable";

export default function HeroSection() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/events");
    };

    return (
        <section className="relative min-h-screen flex flex-col justify-start items-center text-center py-20 bg-black">
            {/* Background Image with Gradient Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>

            {/* Hero Content (Adjusted Spacing) */}
            <div className="relative z-10 mt-40 space-y-6">
                {" "}
                {/* ✅ Increased whitespace */}
                <h2 className="text-5xl font-extrabold text-white">
                    Never Miss an Event at 42
                </h2>
                <p className="text-xl text-gray-300">
                    Discover, subscribe, and stay updated on coding workshops,
                    hackathons, and community events.
                </p>
                <Button className="mt-6 px-12 py-6 text-lg font-semibold rounded-[32px]">
                    View All Events
                </Button>
            </div>

            {/* Events Table with Matching Aesthetic */}
            <div className="mt-32 w-full flex justify-center">
                <EventsTable />
            </div>
        </section>
    );
}
