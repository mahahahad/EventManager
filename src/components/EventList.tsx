"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useRef } from "react";

type Event = {
    id: string;
    title: string;
    date: string;
};

export default function EventList({ isAdmin }: { isAdmin: boolean }) {
    const [editTitle, setEditTitle] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase.from("events").select("*");

            console.log("Fetched events:", data); // ✅ Check the console for events

            if (!error) setEvents(data as Event[]);
        };
        fetchEvents();
    }, []);

    const handleEditClick = (event: Event) => {
        setEditingId(event.id); // ✅ Set this event into edit mode
        setEditTitle(event.title); // ✅ Initialize input with current title
        setTimeout(() => inputRef.current?.focus(), 10); // ✅ Delays focus slightly to avoid rendering issues
    };

    const handleSaveClick = async (eventId: string) => {
        const { error } = await supabase
            .from("events")
            .update({ title: editTitle })
            .eq("id", eventId);
        if (!error) {
            setEvents(
                events.map((event) =>
                    event.id === eventId
                        ? { ...event, title: editTitle }
                        : event
                )
            );
            setEditingId(null); // ✅ Exit edit mode after saving
        }
    };

    const handleDelete = async (eventId: string) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );
        if (!confirmDelete) return;

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId);

        if (!error) setEvents(events.filter((event) => event.id !== eventId));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">Events</h1>
            {events.map((event) => (
                <Card key={event.id} className="p-4 mt-4">
                    {editingId === event.id ? (
                        <>
                            <input
                                type="text"
                                ref={inputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="border rounded p-2"
                            />
                            <Button onClick={() => handleSaveClick(event.id)}>
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl">{event.title}</h2>
                            {isAdmin && (
                                <Button onClick={() => handleEditClick(event)}>
                                    Edit
                                </Button>
                            )}
                        </>
                    )}

                    {isAdmin && (
                        <Button
                            className="bg-red-500 text-white"
                            onClick={() => handleDelete(event.id)}
                        >
                            Delete
                        </Button>
                    )}
                </Card>
            ))}
        </div>
    );
}
