"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Event as EventData } from "@/types/event";
import Link from "next/link";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
} from "framer-motion";

export default function EventsTable() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            const today = new Date().toISOString();
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .gte("start_time", today)
                .order("start_time", { ascending: true })
                .limit(5);

            if (error) {
                console.error("Error fetching events:", error);
                setEvents([]);
            } else {
                setEvents(data || []);
            }
            setIsLoading(false);
        };

        fetchEvents();

        const channel = supabase
            .channel("events_realtime_homepage")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                () => {
                    fetchEvents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleRowClick = (event: EventData) => {
        setSelectedEvent(event);
        setDialogOpen(true);
    };

    return (
        <>
            <div className="w-full max-w-4xl xl:max-w-5xl backdrop-blur-xl bg-black/40 shadow-2xl shadow-blue-500/10 rounded-xl p-4 sm:p-6 space-y-6 border border-gray-700/50 relative">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-left text-white">
                        Upcoming Events
                    </h2>
                </div>

                {isLoading ? (
                    <div className="text-center text-gray-400 py-10">
                        Loading events...
                    </div>
                ) : events.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="py-2 px-4 text-left text-gray-400 font-semibold">
                                        Title
                                    </th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-semibold">
                                        Start Time
                                    </th>
                                    <th className="py-2 px-4 text-left text-gray-400 font-semibold">
                                        Location
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-gray-800/50 transition cursor-pointer"
                                        onClick={() =>
                                            (window.location.href = `/events/${event.id}`)
                                        }
                                        onMouseEnter={() =>
                                            setHoveredEvent(event)
                                        }
                                        onMouseLeave={() =>
                                            setHoveredEvent(null)
                                        }
                                    >
                                        <td className="py-2 px-4">
                                            {event.title}
                                        </td>
                                        <td className="py-2 px-4">
                                            {new Date(
                                                event.start_time
                                            ).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </td>
                                        <td className="py-2 px-4">
                                            {event.location}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-10">
                        No upcoming events available at the moment.
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-gray-900/80 backdrop-blur-lg border-gray-700 text-white rounded-xl shadow-xl max-w-lg w-full p-0">
                        {selectedEvent && (
                            <>
                                <DialogHeader className="p-6 border-b border-gray-700/50">
                                    <DialogTitle className="text-2xl font-semibold text-blue-400">
                                        {selectedEvent.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400 pt-1">
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
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                    <p>
                                        <strong className="text-gray-300">
                                            Location:
                                        </strong>{" "}
                                        {selectedEvent.location || "TBA"}
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                        <strong className="text-gray-300">
                                            Description:
                                        </strong>{" "}
                                        {selectedEvent.description ||
                                            "No details available."}
                                    </p>
                                </div>
                                <DialogFooter className="p-6 border-t border-gray-700/50 flex flex-col sm:flex-row sm:justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="border-gray-600 hover:bg-gray-700/50"
                                    >
                                        Close
                                    </Button>
                                    {selectedEvent.external_id &&
                                        selectedEvent.source === "intra_42" && (
                                            <Button
                                                onClick={() =>
                                                    window.open(
                                                        `https://intra.42.fr/events/${selectedEvent.external_id}`,
                                                        "_blank"
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                                            >
                                                Open on Intra
                                            </Button>
                                        )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Animated Tooltip */}
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
                        }}
                    >
                        {hoveredEvent.description}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
