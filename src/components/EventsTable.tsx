// components/EventsTable.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Event as EventData } from "@/types/database";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { motion } from "framer-motion";
import { Info, ArrowUpDown } from "lucide-react";
import EventDialog from "@/components/EventDialog";
import { supabase } from "@/lib/supabaseClient";

interface Props {
    events: EventData[];
}

interface ColumnHeaderProps {
    sortKey: keyof EventData;
    currentSort: {
        key: keyof EventData;
        direction: "ascending" | "descending";
    } | null;
    requestSort: (key: keyof EventData) => void;
    children: React.ReactNode;
    className?: string;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
    sortKey,
    currentSort,
    requestSort,
    children,
    className,
}) => {
    const isActive = currentSort?.key === sortKey;
    const directionIcon = isActive
        ? currentSort?.direction === "ascending"
            ? "↑"
            : "↓"
        : null;
    return (
        <th
            className={`text-left font-medium text-gray-400 hover:text-gray-100 cursor-pointer group transition-colors ${
                className || ""
            }`}
            onClick={() => requestSort(sortKey)}
            title={`Sort by ${
                typeof children === "string" ? children : String(sortKey)
            }`}
        >
            <div className="flex items-center gap-1.5">
                {children}
                <span
                    className={`transition-opacity text-xs ${
                        isActive
                            ? "opacity-100 text-blue-400"
                            : "opacity-0 group-hover:opacity-60"
                    }`}
                >
                    {directionIcon || <ArrowUpDown size={12} />}
                </span>
            </div>
        </th>
    );
};

export default function EventsTable({ events: initialEvents }: Props) {
    const [events, setEvents] = useState<EventData[]>(initialEvents);
    const [selectedEventForDialog, setSelectedEventForDialog] = useState<EventData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof EventData; direction: "ascending" | "descending"; } | null>({ key: "start_time", direction: "descending" });

    const openEventDialog = (event: EventData) => {
        setSelectedEventForDialog(event);
        setIsDialogOpen(true);
    };

    const sortedEvents = useMemo(() => {
        let sortableItems = [...events];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA_orig = a[sortConfig.key];
                const valB_orig = b[sortConfig.key];
                if (
                    sortConfig.key === "start_time" ||
                    sortConfig.key === "end_time"
                ) {
                    const dateA = valA_orig ? new Date(valA_orig as string).getTime() : 0;
                    const dateB = valB_orig ? new Date(valB_orig as string).getTime() : 0;
                    if (dateA < dateB) return sortConfig.direction === "ascending" ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === "ascending" ? 1 : -1;
                    return 0;
                }
                let valA_str = String(valA_orig === null || valA_orig === undefined ? "" : valA_orig).toLowerCase();
                let valB_str = String(valB_orig === null || valB_orig === undefined ? "" : valB_orig).toLowerCase();
                if (valA_str < valB_str) return sortConfig.direction === "ascending" ? -1 : 1;
                if (valA_str > valB_str) return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [events, sortConfig]);

    const requestSort = (key: keyof EventData) => {
        let direction: "ascending" | "descending" = "descending";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "descending") {
            direction = "ascending";
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        const channel = supabase
            .channel("realtime-events-table")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        setEvents((prev) => [...prev, payload.new as EventData]);
                    } else if (payload.eventType === "UPDATE") {
                        setEvents((prev) =>
                            prev.map((ev) =>
                                ev.id === (payload.new as EventData).id
                                    ? (payload.new as EventData)
                                    : ev
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setEvents((prev) =>
                            prev.filter((ev) => ev.id !== (payload.old as EventData).id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400 bg-black/20 rounded-xl border border-gray-700/50">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-300">No Events Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto custom-scrollbar-thin rounded-xl border border-gray-700/50 bg-black/40 backdrop-blur-md">
            <table className="w-full min-w-[700px] table-auto text-sm">
                <thead className="border-b border-gray-700/60 bg-black/60 backdrop-blur-md sticky top-0 z-10">
                    <tr>
                        <ColumnHeader sortKey="title" currentSort={sortConfig} requestSort={requestSort} className="w-[40%] pl-6 pr-3 py-4">Title</ColumnHeader>
                        <ColumnHeader sortKey="start_time" currentSort={sortConfig} requestSort={requestSort} className="w-[25%] px-3 py-4">Date & Time</ColumnHeader>
                        <ColumnHeader sortKey="location" currentSort={sortConfig} requestSort={requestSort} className="w-[25%] px-3 py-4">Location</ColumnHeader>
                        <th className="w-[10%] px-6 py-4 text-center font-medium text-gray-400">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                    {sortedEvents.map((event) => (
                        <motion.tr
                            key={event.id}
                            className="group hover:bg-gray-500/20 transition-colors duration-150"
                        >
                            <td className="pl-6 pr-3 py-3.5 text-gray-100 text-left group-hover:text-white font-medium truncate">
                                <span className="hover:text-sky-300 transition-colors cursor-pointer" onClick={() => openEventDialog(event)}>
                                    {event.title}
                                </span>
                            </td>
                            <td className="px-3 py-3.5 text-gray-300 text-left group-hover:text-gray-100 whitespace-nowrap">
                                {new Date(event.start_time).toLocaleString(undefined, {
                                    year: "numeric", month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit", hour12: true,
                                })}
                            </td>
                            <td className="px-3 py-3.5 text-gray-300 text-left group-hover:text-gray-100 truncate">
                                {event.location || "N/A"}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-400 hover:text-sky-300 hover:bg-sky-700/30 rounded-full transition-all"
                                    onClick={() => openEventDialog(event)}
                                    aria-label="View event quick details"
                                >
                                    <Info size={18} />
                                </Button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            <EventDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                event={selectedEventForDialog}
            />
        </div>
    );
}
