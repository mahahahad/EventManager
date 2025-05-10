"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroSection() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/events");
    };
    return (
        <section className="text-center py-20 ">
            <h2 className="text-4xl font-bold">Never Miss an Event at 42</h2>
            <p className="text-lg  mt-4">
                Discover, subscribe, and stay updated on coding workshops,
                hackathons, and community events.
            </p>
            <Button className="mt-6" onClick={handleRedirect}>
                Explore Events
            </Button>
        </section>
    );
}
