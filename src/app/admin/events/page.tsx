"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { IoCloudUploadOutline, IoTrash, IoLink } from "react-icons/io5";
import {
    Dialog,
    DialogContent,
    DialogDescription as DialogDescriptionUI,
    DialogFooter,
    DialogHeader as DialogHeaderUI,
    DialogTitle as DialogTitleUI,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import FullScreenBackground from "@/components/FullScreenBackground"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Event {
    id: string;
    title: string;
    start_time: string;
    location?: string;
    description?: string;
    external_id?: string;
    source?: string;
    // Add other relevant event properties
}

interface EventsTableProps {
    events: Event[] | null;
}

const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX + 10);
            mouseY.set(e.clientY + 10);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const handleRowClick = (event: Event) => {
        setSelectedEvent(event);
        setDialogOpen(true);
    };

    if (!events) {
        return (
            <div className="w-full backdrop-blur-xl bg-black/40 shadow-2xl shadow-blue-500/10 rounded-xl p-4 sm:p-6 space-y-6 border border-gray-700/50 relative">
                <div className="text-center text-gray-400 py-10">
                    Loading events...
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="w-full backdrop-blur-xl bg-black/40 shadow-2xl shadow-blue-500/10 rounded-xl p-4 sm:p-6 space-y-6 border border-gray-700/50 relative">
                <div className="text-center text-gray-400 py-10">
                    No upcoming events available at the moment.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <div className="max-w-full backdrop-blur-xl bg-black/40 shadow-2xl shadow-blue-500/10 rounded-xl p-4 sm:p-6 space-y-6 border border-gray-700/50 relative">
                <table className="w-full table-auto text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="py-2 px-4 text-left text-gray-400 font-semibold w-32 overflow-hidden text-ellipsis">
                                Title
                            </th>
                            <th className="py-2 px-4 text-left text-gray-400 font-semibold w-40 overflow-hidden text-ellipsis">
                                Start Time
                            </th>
                            <th className="py-2 px-4 text-left text-gray-400 font-semibold w-24 overflow-hidden text-ellipsis">
                                Location
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <motion.tr
                                key={event.id}
                                className="hover:bg-gray-800/50 transition cursor-pointer"
                                onClick={() => handleRowClick(event)}
                                onMouseEnter={() => setHoveredEvent(event)}
                                onMouseLeave={() => setHoveredEvent(null)}
                            >
                                <td className="py-2 px-4 w-32 overflow-hidden text-ellipsis whitespace-nowrap text-gray-300">
                                    {event.title}
                                </td>
                                <td className="py-2 px-4 w-40 overflow-hidden text-ellipsis whitespace-nowrap text-gray-300">
                                    {new Date(event.start_time).toLocaleString(
                                        undefined,
                                        {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }
                                    )}
                                </td>
                                <td className="py-2 px-4 w-24 overflow-hidden text-ellipsis whitespace-nowrap text-gray-300">
                                    {event.location}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900/80 backdrop-blur-lg border-gray-700 text-white rounded-xl shadow-xl max-w-lg w-full p-0">
                        {selectedEvent && (
                            <>
                                <DialogHeaderUI className="p-6 border-b border-gray-700/50">
                                    <DialogTitleUI className="text-2xl font-semibold text-blue-400">
                                        {selectedEvent.title}
                                    </DialogTitleUI>
                                    <DialogDescriptionUI className="text-gray-400 pt-1">
                                        {new Date(
                                            selectedEvent.start_time
                                        ).toLocaleString(undefined, {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </DialogDescriptionUI>
                                </DialogHeaderUI>
                                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <p>
                                        <strong className="text-gray-300">
                                            Location:
                                        </strong>
                                        {selectedEvent.location || "TBA"}
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                        <strong className="text-gray-300">
                                            Description:
                                        </strong>
                                        {selectedEvent.description ||
                                            "No details available."}
                                    </p>
                                    {selectedEvent.external_id &&
                                        selectedEvent.source ===
                                        "intra_42" && (
                                            <div className="mt-4">
                                                <strong className="text-gray-300">
                                                    Intra 42 Link:
                                                </strong>
                                                <a
                                                    href={`https://intra.42.fr/events/${selectedEvent.external_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                                                >
                                                    Open on Intra <IoLink size={16} />
                                                </a>
                                            </div>
                                        )}
                                </div>
                                <DialogFooter className="p-6 border-t border-gray-700/50 flex flex-col sm:flex-row sm:justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="border-gray-600 hover:bg-gray-700/50"
                                    >
                                        Close
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            <AnimatePresence>
                {hoveredEvent && hoveredEvent.description && (
                    <motion.div
                        key={hoveredEvent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                        }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            translateX: smoothX,
                            translateY: smoothY,
                            backgroundColor: "rgba(0, 0, 0, 0.85)",
                            color: "white",
                            padding: "0.5rem",
                            borderRadius: "0.3rem",
                            zIndex: 1000,
                            pointerEvents: "none",
                            maxWidth: "300px",
                            fontSize: "0.8rem",
                            lineHeight: "1.4",
                            boxShadow:
                                "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 5px 15px rgba(0, 0, 0, 0.1)", // Add a subtle shadow
                        }}
                    >
                        {hoveredEvent.description}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdminEventsPage = () => {
    const [events, setEvents] = useState<Event[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [selectAllChecked, setSelectAllChecked] = useState(false); // New state for select all

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("start_time", { ascending: true });

        if (error) {
            console.error("Error fetching events:", error);
            setError("Failed to fetch events.");
        } else if (data) {
            setEvents(data);
        }

        setLoading(false);
    };

    const handleCheckboxChange = (eventId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedEvents([...selectedEvents, eventId]);
        } else {
            setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
        }
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (events) {
            const eventIds = events.map((event) => event.id);
            setSelectedEvents(isChecked ? eventIds : []);
            setSelectAllChecked(isChecked); // Update the state
        }
    };

    useEffect(() => {
        // Update "select all" checkbox based on selected events
        if (events) {
            setSelectAllChecked(
                selectedEvents.length > 0 &&
                    selectedEvents.length === events.length
            );
        }
    }, [selectedEvents, events]);

    const handleBulkDelete = async () => {
        if (selectedEvents.length === 0) {
            alert("Please select events to delete.");
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete ${selectedEvents.length} selected events?`
            )
        ) {
            setIsBulkDeleting(true);
            setError(null);

            const { error: deleteError } = await supabase
                .from("events")
                .delete()
                .in("id", selectedEvents);

            if (deleteError) {
                console.error("Error deleting events:", deleteError);
                setError("Failed to delete selected events.");
                alert("Failed to delete selected events.");
            } else {
                console.log(
                    `Successfully deleted ${selectedEvents.length} events.`
                );
                setSelectedEvents([]);
                fetchEvents();
                alert("Selected events deleted successfully!");
            }
            setIsBulkDeleting(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);
            if (error) {
                console.error("Error deleting event:", error);
                alert("Failed to delete event.");
            } else {
                setEvents(
                    events ? events.filter((event) => event.id !== id) : []
                );
                alert("Event deleted successfully!");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                Loading events...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const backgroundImage =
        "https://images.unsplash.com/photo-1499363536502-876489112b1c?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Replace with your actual image URL

    return (
        <div className="relative z-10">
            <FullScreenBackground
                imageUrl={backgroundImage}
                animatedGradient={true}
                blur={true}
                darkOverlay={true}
            />
            <div className="pt-20 relative z-10">
                <AdminNavbar />
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Manage Events
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/admin/events/create">
                            <Button
                                variant="outline"
                                className={cn(
                                    "bg-green-500/20 text-white border-green-500/30",
                                    "hover:bg-green-500/30 hover:border-green-500/50",
                                    "transition-all duration-300 shadow-lg hover:shadow-green-500/20"
                                )}
                            >
                                Create New Event
                            </Button>
                        </Link>
                        <Link href="/admin/import">
                            <Button
                                variant="outline"
                                className={cn(
                                    "bg-blue-500/20 text-white border-blue-500/30",
                                    "hover:bg-blue-500/30 hover:border-blue-500/50",
                                    "transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                                )}
                            >
                                <IoCloudUploadOutline className="mr-2 h-4 w-4" />
                                Import Events
                            </Button>
                        </Link>
                        {selectedEvents.length > 0 && (
                            <Button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className={cn(
                                    "bg-red-500/20 text-white border-red-500/30",
                                    "hover:bg-red-500/30 hover:border-red-500/50",
                                    "transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                                )}
                            >
                                {isBulkDeleting
                                    ? "Deleting..."
                                    : `Bulk Delete (${selectedEvents.length})`}
                                <IoTrash className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <Card className="bg-black/50 border-gray-700 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Event List
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                View and manage events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {events && events.length > 0 ? (
                                <>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[60px] text-white">
                                                        <Checkbox
                                                            aria-label="Select all events"
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleSelectAll(
                                                                    !!checked
                                                                )
                                                            }
                                                            checked={
                                                                events.length >
                                                                    0 &&
                                                                selectedEvents
                                                                    .length ===
                                                                    events.length
                                                            }
                                                        />
                                                    </TableHead>
                                                    <TableHead className="text-white">
                                                        Title
                                                    </TableHead>
                                                    <TableHead className="text-white">
                                                        Start Time
                                                    </TableHead>
                                                    <TableHead className="text-white">
                                                        Location
                                                    </TableHead>
                                                    <TableHead className="text-right text-white">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {events.map((event) => (
                                                    <TableRow
                                                        key={event.id}
                                                        className="hover:bg-gray-800/50 transition-colors"
                                                    >
                                                        <TableCell
                                                            className="font-medium"
                                                        >
                                                            <Checkbox
                                                                aria-label={`Select event ${event.title}`}
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleCheckboxChange(
                                                                        event.id,
                                                                        !!checked
                                                                    )
                                                                }
                                                                checked={selectedEvents.includes(
                                                                    event.id
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {event.title}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {new Date(
                                                                event.start_time
                                                            ).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {event.location}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Link
                                                                href={`/admin/events/${event.id}`}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDeleteEvent(
                                                                        event.id
                                                                    )
                                                                }
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                <IoTrash className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {/* <EventsTable events={events} /> */}
                                </>
                            ) : (
                                <p className="text-gray-400">No events found.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminEventsPage;

