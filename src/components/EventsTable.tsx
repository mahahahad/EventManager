"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "./ui/data-table";

interface EventData {
    id: number;
    title: string;
    start_time: string;
    location: string;
    description?: string;
    external_id: number;
    source?: string;
}

export default function EventsTable() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("start_time", { ascending: false });
            if (!error) setEvents(data);
        };

        fetchEvents();

        const channel = supabase
            .channel("events_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                (payload) => {
                    const newEvent = payload.new as EventData;
                    if (!newEvent?.id) return;

                    setEvents((prevEvents) => {
                        const updatedEvents = prevEvents.map((event) =>
                            event.id === newEvent.id ? newEvent : event
                        );
                        return updatedEvents;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel); // ✅ Cleanup on unmount
        };
    }, []);

    const handleRowClick = (event: EventData) => {
        if (!event.id || event.title === "...") return; // ✅ Ignore empty rows
        setSelectedEvent(event);
        setDialogOpen(true);
    };

    const filteredEvents = events
        .filter(
            (event) =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

    const modifiedEvents = [
        ...filteredEvents,
        {
            id: 0,
            title: "...",
            start_time: "",
            location: "",
            source: undefined,
            external_id: 0,
        },
    ];

    const columns: ColumnDef<EventData>[] = [
        { accessorKey: "title", header: "Event Title" },
        { accessorKey: "start_time", header: "Start Time" },
        { accessorKey: "location", header: "Location" },
    ];

    return (
        <div className="w-[85%] backdrop-blur-lg bg-black/30 shadow-md rounded-[24px] p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-left text-white">
                    Upcoming Events
                </h1>
                <div className="relative w-[28%]">
                    <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 rounded-lg p-4 text-left"
                    />
                    {searchTerm && (
                        <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            onClick={() => setSearchTerm("")}
                        >
                            ✖
                        </button>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={modifiedEvents}
                onRowClick={handleRowClick}
                className="text-left rounded-lg"
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden p-6 rounded-[16px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-left">
                            {selectedEvent?.title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-left">
                            {selectedEvent?.start_time
                                ? new Date(
                                      selectedEvent.start_time
                                  ).toLocaleString()
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 text-left">
                        <p>
                            <strong>Location:</strong>{" "}
                            {selectedEvent?.location || "TBA"}
                        </p>
                        <p>
                            <strong>Description:</strong>{" "}
                            {selectedEvent?.description ||
                                "No details available."}
                        </p>
                    </div>
                    {selectedEvent?.external_id &&
                        selectedEvent?.source === "intra_42" && (
                            <div className="pt-4 text-left">
                                <Button
                                    className="w-full rounded-lg"
                                    onClick={() =>
                                        window.open(
                                            `https://intra.42.fr/events/${selectedEvent?.external_id}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    Open Event Page
                                </Button>
                            </div>
                        )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
