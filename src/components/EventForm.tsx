"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function EventForm() {
    const [eventName, setEventName] = useState("");

    return (
        <Card className="p-4">
            <h2 className="text-xl font-bold">Create an Event</h2>
            <Input
                placeholder="Event Name"
                onChange={(e) => setEventName(e.target.value)}
            />
            <Button className="mt-4">Submit</Button>
        </Card>
    );
}
