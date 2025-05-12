"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import FullScreenBackground from "@/components/FullScreenBackground";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Event as EventData } from "@/types/database";
import {
    PlusCircle,
    UploadCloud,
    Trash2,
    Edit3,
    Search,
    X,
    XCircle,
    Loader2,
    ArrowUpDown,
} from "lucide-react";

interface ColumnHeaderProps {
    sortKey: keyof EventData | "actions" | "select";
    currentSort?: {
        key: keyof EventData;
        direction: "ascending" | "descending";
    } | null;
    requestSort?: (key: keyof EventData) => void;
    children: React.ReactNode;
    className?: string;
    isActionOrSelect?: boolean;
}

const AdminColumnHeader: React.FC<ColumnHeaderProps> = ({
    sortKey,
    currentSort,
    requestSort,
    children,
    className,
    isActionOrSelect,
}) => {
    const isActive = !isActionOrSelect && currentSort?.key === sortKey;
    const directionIcon = isActive
        ? currentSort?.direction === "ascending"
            ? "↑"
            : "↓"
        : null;
    const canSort = !isActionOrSelect && requestSort;

    return (
        <TableHead
            className={cn(
                "font-medium text-gray-400 group transition-colors",
                canSort ? "hover:text-gray-100 cursor-pointer" : "",
                className
            )}
            onClick={
                canSort
                    ? () => requestSort(sortKey as keyof EventData)
                    : undefined
            }
            title={
                canSort
                    ? `Sort by ${
                          typeof children === "string"
                              ? children
                              : String(sortKey)
                      }`
                    : undefined
            }
        >
            <div className="flex items-center gap-1.5">
                {children}
                {canSort && (
                    <span
                        className={`transition-opacity text-xs ${
                            isActive
                                ? "opacity-100 text-blue-400"
                                : "opacity-0 group-hover:opacity-60"
                        }`}
                    >
                        {directionIcon || <ArrowUpDown size={12} />}
                    </span>
                )}
            </div>
        </TableHead>
    );
};

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof EventData;
        direction: "ascending" | "descending";
    } | null>({ key: "start_time", direction: "descending" });

    const fetchEvents = async () => {
        setError(null);
        const { data, error: fetchError } = await supabase
            .from("events")
            .select("*")
            .order("start_time", { ascending: true });
        if (fetchError) {
            setError("Failed to fetch events.");
            setEvents([]);
        } else {
            setEvents(data || []);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchEvents().finally(() => setLoading(false));

        const channel = supabase
            .channel("events-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "events" },
                (payload) => {
                    fetchEvents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const sortedFilteredEvents = useMemo(() => {
        let itemsToProcess: EventData[] = [...events];
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            itemsToProcess = itemsToProcess.filter((event) =>
                [
                    event.title,
                    event.location,
                    event.description,
                    String(event.id),
                ]
                    .filter(Boolean)
                    .some((field) =>
                        field!.toLowerCase().includes(lowercasedQuery)
                    )
            );
        }

        if (sortConfig !== null) {
            itemsToProcess.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (
                    sortConfig.key === "start_time" ||
                    sortConfig.key === "end_time"
                ) {
                    const dateA = valA ? new Date(valA as string).getTime() : 0;
                    const dateB = valB ? new Date(valB as string).getTime() : 0;
                    return sortConfig.direction === "ascending"
                        ? dateA - dateB
                        : dateB - dateA;
                }

                const valA_str = String(valA ?? "").toLowerCase();
                const valB_str = String(valB ?? "").toLowerCase();

                return sortConfig.direction === "ascending"
                    ? valA_str.localeCompare(valB_str)
                    : valB_str.localeCompare(valA_str);
            });
        }
        return itemsToProcess;
    }, [searchQuery, events, sortConfig]);

    useEffect(() => {
        setSelectedEvents([]);
    }, [sortedFilteredEvents]);

    const requestSortAdmin = (key: keyof EventData) => {
        const isSameKey = sortConfig?.key === key;
        const direction =
            isSameKey && sortConfig?.direction === "ascending"
                ? "descending"
                : "ascending";
        setSortConfig({ key, direction });
    };

    const handleCheckboxChange = (eventId: string, isChecked: boolean) => {
        setSelectedEvents((prevSelected) =>
            isChecked
                ? [...prevSelected, eventId]
                : prevSelected.filter((id) => id !== eventId)
        );
    };

    const handleSelectAll = (isChecked: boolean) => {
        setSelectedEvents(
            isChecked ? sortedFilteredEvents.map((event) => event.id) : []
        );
    };

    const handleBulkDelete = async () => {
        if (selectedEvents.length === 0)
            return alert("Please select events to delete.");
        if (
            !confirm(
                `Are you sure you want to delete ${selectedEvents.length} selected events?`
            )
        )
            return;

        setIsBulkDeleting(true);
        setError(null);
        const { error: deleteError } = await supabase
            .from("events")
            .delete()
            .in("id", selectedEvents);
        if (deleteError) {
            setError("Failed to delete selected events.");
            alert("Failed to delete selected events.");
        } else {
            setSelectedEvents([]);
            await fetchEvents();
            alert("Selected events deleted successfully!");
        }
        setIsBulkDeleting(false);
    };

    const handleDeleteEvent = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete the event \"${title}\"?`))
            return;
        const { error: deleteError } = await supabase
            .from("events")
            .delete()
            .eq("id", id);
        if (deleteError) {
            alert(`Failed to delete event: ${deleteError.message}`);
        } else {
            await fetchEvents();
            alert("Event deleted successfully!");
        }
    };

    const clearSearch = () => setSearchQuery("");

    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground />
            <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
                <div className="bg-black/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 space-y-8">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Manage Events
                        </h1>
                        <div className="flex gap-2">
                            <Link href="/admin/events/create">
                                <Button variant="default" className="gap-2">
                                    <PlusCircle size={18} /> New Event
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                disabled={
                                    isBulkDeleting ||
                                    selectedEvents.length === 0
                                }
                            >
                                {isBulkDeleting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />{" "}
                                        Deleting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Trash2 size={16} /> Delete Selected
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="relative mt-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search
                                className="absolute left-3 top-2.5 text-gray-400"
                                size={18}
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="overflow-x-auto mt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <AdminColumnHeader
                                        sortKey="select"
                                        isActionOrSelect
                                        className="w-4"
                                    >
                                        <Checkbox
                                            checked={
                                                selectedEvents.length ===
                                                    sortedFilteredEvents.length &&
                                                sortedFilteredEvents.length > 0
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSelectAll(
                                                    checked as boolean
                                                )
                                            }
                                        />
                                    </AdminColumnHeader>
                                    <AdminColumnHeader
                                        sortKey="title"
                                        currentSort={sortConfig}
                                        requestSort={requestSortAdmin}
                                    >
                                        Title
                                    </AdminColumnHeader>
                                    <AdminColumnHeader
                                        sortKey="location"
                                        currentSort={sortConfig}
                                        requestSort={requestSortAdmin}
                                    >
                                        Location
                                    </AdminColumnHeader>
                                    <AdminColumnHeader
                                        sortKey="start_time"
                                        currentSort={sortConfig}
                                        requestSort={requestSortAdmin}
                                    >
                                        Start Time
                                    </AdminColumnHeader>
                                    <AdminColumnHeader
                                        sortKey="end_time"
                                        currentSort={sortConfig}
                                        requestSort={requestSortAdmin}
                                    >
                                        End Time
                                    </AdminColumnHeader>
                                    <AdminColumnHeader
                                        sortKey="actions"
                                        isActionOrSelect
                                    >
                                        Actions
                                    </AdminColumnHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-10"
                                        >
                                            <Loader2 className="animate-spin mx-auto text-gray-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : sortedFilteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-10"
                                        >
                                            No events found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedFilteredEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedEvents.includes(
                                                        event.id
                                                    )}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleCheckboxChange(
                                                            event.id,
                                                            checked as boolean
                                                        )
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{event.title}</TableCell>
                                            <TableCell>
                                                {event.location}
                                            </TableCell>
                                            <TableCell>
                                                {event.start_time
                                                    ? new Date(
                                                          event.start_time
                                                      ).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {event.end_time
                                                    ? new Date(
                                                          event.end_time
                                                      ).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Link
                                                    href={`/admin/events/${event.id}`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDeleteEvent(
                                                            event.id,
                                                            event.title
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </div>
    );
}
