"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EditEvent({ event }: { event: any }) {
    const [title, setTitle] = useState(event.title);
    const [date, setDate] = useState(event.date);

    const updateEvent = async () => {
        const { error } = await supabase
            .from("events")
            .update({ title, date })
            .eq("id", event.id);

        if (error) {
            console.error("Error updating event:", error);
            alert("Oh no! Something went wrong 😢 Try again!");
        } else {
            alert("Event updated successfully! 🎉");
        }
    };

    return (
        <div>
            <h2>Edit Event</h2>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={updateEvent}>Save Changes</button>
        </div>
    );
}
