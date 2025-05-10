"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const columns: ColumnDef<any>[] = [
    { accessorKey: "title", header: "Event Title" },
    { accessorKey: "start_time", header: "Start Time" },
    { accessorKey: "location", header: "Location" },
];

export default function EventsTable() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
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
    }, []);

    const handleRowClick = (event: any) => {
        setSelectedEvent(event);
        setDialogOpen(true);
    };

    const handleOpenEventPage = (event: any) => {
        window.open(
            `https://intra.42.fr/events/${event.external_id}`,
            "_blank"
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>

            <DataTable
                columns={columns}
                data={events}
                onRowClick={handleRowClick} // custom prop
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden p-6">
                    {/* Header */}
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {selectedEvent?.title}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {new Date(
                                selectedEvent?.start_time
                            ).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
                        <p className="whitespace-pre-wrap break-words">
                            <strong>Location:</strong>{" "}
                            {selectedEvent?.location || "TBA"}
                        </p>
                        <p className="whitespace-pre-wrap break-words">
                            <strong>Description:</strong>{" "}
                            {selectedEvent?.description ||
                                "No details available."}
                        </p>
                    </div>

                    {/* Sticky Footer Button */}
                    <div className="pt-4">
                        <Button
                            className="w-full"
                            onClick={() => {
                                handleOpenEventPage(selectedEvent);
                            }}
                        >
                            Open Event Page
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
