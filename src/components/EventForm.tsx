"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EventForm({ eventId }: { eventId?: string }) {
    const [eventName, setEventName] = useState("");
    const router = useRouter();

    // ✅ Fetch event details when editing
    useEffect(() => {
        const fetchEvent = async () => {
            if (eventId) {
                const { data } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", eventId)
                    .single();
                setEventName(data?.name || "");
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleSubmit = async () => {
        const { error } = await supabase.from("events").insert([
            {
                title: eventName, // ✅ Maps correctly to database column
                date: new Date().toISOString(), // ✅ Adds a timestamp for now
            },
        ]);

        if (error) {
            console.error("Error inserting event:", error.message);
        } else {
            router.replace("/events"); // Redirects after successful insert
        }
    };

    return (
        <Card className="p-4">
            <h2 className="text-xl font-bold">
                {eventId ? "Edit Event" : "Create Event"}
            </h2>
            <Input
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
            />
            <Button className="mt-4" onClick={handleSubmit}>
                {eventId ? "Update Event" : "Create Event"}
            </Button>
        </Card>
    );
}
