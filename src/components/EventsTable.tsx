"use client";
import { X } from "lucide-react";
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

type SimpleColumn = {
    id: string;
    header: string;
};

export default function EventsTable() {
    const [events, setEvents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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
        if (event.title !== "...") {
            setSelectedEvent(event);
            setDialogOpen(true);
        }
    };

    const filteredEvents = events
        .filter(
            (event) =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

    // Append an empty row at the end to indicate more events
    const modifiedEvents = [
        ...filteredEvents,
        { title: "...", start_time: null, location: "" },
    ];

    const columns: ColumnDef<any>[] = [
        { accessorKey: "title", header: "Event Title" },
        { accessorKey: "start_time", header: "Start Time" },
        { accessorKey: "location", header: "Location" },
    ];

    const handleOpenEventPage = (event: any) => {
        window.open(
            `https://intra.42.fr/events/${event.external_id}`,
            "_blank"
        );
    };

    return (
        <div className="flex justify-center">
            <div className="w-[75%] p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Upcoming Events</h1>
                    <div className="relative w-[28%]">
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10"
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                onClick={() => setSearchTerm("")}
                            >
                                <X className="w-5 h-5" />{" "}
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Wrapper */}
                <div className="table-fixed w-full border border-gray-300 rounded-md">
                    <DataTable
                        columns={columns}
                        data={modifiedEvents} // ✅ Limited events & added empty row
                        onRowClick={handleRowClick}
                    />

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden p-6">
                            {/* Header */}
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">
                                    {selectedEvent?.title}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    {selectedEvent?.start_time
                                        ? new Date(
                                              selectedEvent.start_time
                                          ).toLocaleString()
                                        : ""}
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
                                    onClick={() =>
                                        handleOpenEventPage(selectedEvent)
                                    }
                                >
                                    Open Event Page
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
