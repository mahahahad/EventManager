"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddEvent() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");

    const addEvent = async () => {
        const { error } = await supabase
            .from("events")
            .insert([{ title, date }]);
        if (error) {
            console.error("Error adding event:", error);
            alert("Oh no! Something went wrong 😢 Try again!");
        } else {
            alert("Event added successfully! 🎉");
            setTitle("");
            setDate("");
        }
    };

    return (
        <div>
            <h2>Add a New Event</h2>
            <input
                type="text"
                placeholder="Event Title"
                onChange={(e) => setTitle(e.target.value)}
            />
            <input type="date" onChange={(e) => setDate(e.target.value)} />
            <button onClick={addEvent}>Create Event</button>
        </div>
    );
}
