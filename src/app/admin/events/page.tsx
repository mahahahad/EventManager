// src/app/admin/events/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react"; // Ensured useMemo is imported
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
    // filteredEvents state can be removed if sortedFilteredEvents is used for everything
    // const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
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
    }, []);

    const sortedFilteredEvents = useMemo(() => {
        let itemsToProcess: EventData[] = [...events];
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            itemsToProcess = itemsToProcess.filter(
                (
                    event: EventData // Typed event
                ) =>
                    event.title?.toLowerCase().includes(lowercasedQuery) ||
                    event.location?.toLowerCase().includes(lowercasedQuery) ||
                    event.description
                        ?.toLowerCase()
                        .includes(lowercasedQuery) ||
                    String(event.id).toLowerCase().includes(lowercasedQuery)
            );
        }

        if (sortConfig !== null) {
            itemsToProcess.sort((a: EventData, b: EventData) => {
                // Typed a and b
                const valA_orig = a[sortConfig.key];
                const valB_orig = b[sortConfig.key];
                if (
                    sortConfig.key === "start_time" ||
                    sortConfig.key === "end_time"
                ) {
                    const dateA = valA_orig
                        ? new Date(valA_orig as string).getTime()
                        : 0;
                    const dateB = valB_orig
                        ? new Date(valB_orig as string).getTime()
                        : 0;
                    if (dateA < dateB)
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    if (dateA > dateB)
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    return 0;
                }
                let valA_str = String(valA_orig ?? "").toLowerCase();
                let valB_str = String(valB_orig ?? "").toLowerCase();
                if (valA_str < valB_str)
                    return sortConfig.direction === "ascending" ? -1 : 1;
                if (valA_str > valB_str)
                    return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }
        return itemsToProcess;
    }, [searchQuery, events, sortConfig]);

    // Reset selected events when the list of displayed events changes
    useEffect(() => {
        setSelectedEvents([]);
    }, [sortedFilteredEvents]);

    const requestSortAdmin = (key: keyof EventData) => {
        let direction: "ascending" | "descending" = "descending";
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "descending"
        ) {
            direction = "ascending";
        } else if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "ascending"
        ) {
            direction = "descending";
        }
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

    const isAllFilteredSelected =
        sortedFilteredEvents.length > 0 &&
        selectedEvents.length === sortedFilteredEvents.length;

    const handleBulkDelete = async () => {
        /* ... (same) ... */
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
                setError("Failed to delete selected events.");
                alert("Failed to delete selected events.");
            } else {
                setSelectedEvents([]);
                await fetchEvents();
                alert("Selected events deleted successfully!");
            }
            setIsBulkDeleting(false);
        }
    };
    const handleDeleteEvent = async (id: string, title: string) => {
        /* ... (same) ... */
        if (confirm(`Are you sure you want to delete the event "${title}"?`)) {
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
        }
    };
    const clearSearch = () => setSearchQuery("");

    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground />
            <AdminNavbar />
            <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
                <div className="bg-black/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-6">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400">
                            Event Management
                        </h1>
                        <div className="relative w-full md:w-auto md:min-w-[320px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full py-2.5 pl-10 pr-10 rounded-xl bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Search by title, location, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center flex-wrap">
                        <Button asChild variant="outline" className="w-full sm:w-auto text-green-400 !p-6 rounded-full font-semibold shadow-md  transition-all">
                            <Link href="/admin/events/create" className="flex items-center gap-2">
                                <PlusCircle size={20} /> Create New
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full sm:w-auto border-sky-500 text-sky-300 hover:bg-sky-500/20 hover:text-sky-200 !p-6 rounded-full font-semibold shadow hover:shadow-sky-500/20 transition-all">
                            <Link href="/admin/import" className="flex items-center gap-2">
                                <UploadCloud size={20} /> Import Events
                            </Link>
                        </Button>
                        {selectedEvents.length > 0 && (
                            <Button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                variant="destructive" // This variant already provides good red styling
                                className="w-full sm:w-auto !p-6 rounded-full font-semibold flex items-center gap-2 sm:ml-auto shadow-md hover:shadow-red-500/30 transition-all bg-red-600 hover:bg-red-500 text-white" // Ensured consistency
                            >
                                {isBulkDeleting ? <Loader2 size={20} className="animate-spin mr-2" /> : <Trash2 size={20} className="mr-1.5" />} {/* Adjusted icon size and margin */}
                                {isBulkDeleting ? "Deleting..." : `Delete (${selectedEvents.length})`}
                            </Button>
                        )}
                    </div>

                    <div className="w-full">
                        {loading ? (
                            <div className="border border-gray-700/70 rounded-xl p-6 bg-black/30 animate-pulse space-y-4">
                                <div className="h-8 w-1/3 bg-gray-600/50 rounded"></div>
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-10 w-full bg-gray-600/50 rounded"
                                    ></div>
                                ))}
                            </div>
                        ) : error ? (
                            <Alert
                                variant="destructive"
                                className="bg-red-900/30 border-red-700/50 text-red-300 rounded-xl"
                            >
                                <XCircle className="h-5 w-5 text-red-400" />
                                <AlertTitle className="font-semibold">
                                    Error
                                </AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <div className="border border-gray-700/70 rounded-xl overflow-hidden bg-black/40">
                                <Table className="min-w-[700px]">
                                    <TableHeader className="sticky top-0 bg-black/70 backdrop-blur-sm z-10">
                                        <TableRow className="border-b-gray-700 hover:bg-transparent">
                                            <AdminColumnHeader
                                                sortKey="select"
                                                isActionOrSelect
                                                className="w-[60px] pl-4 pr-2 py-3.5"
                                            >
                                                <Checkbox
                                                    aria-label="Select all visible events"
                                                    checked={
                                                        isAllFilteredSelected
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleSelectAll(
                                                            !!checked
                                                        )
                                                    }
                                                    disabled={
                                                        sortedFilteredEvents.length ===
                                                        0
                                                    }
                                                />
                                            </AdminColumnHeader>
                                            <AdminColumnHeader
                                                sortKey="title"
                                                currentSort={sortConfig}
                                                requestSort={requestSortAdmin}
                                                className="w-[35%] px-3 py-3.5"
                                            >
                                                Title
                                            </AdminColumnHeader>
                                            <AdminColumnHeader
                                                sortKey="start_time"
                                                currentSort={sortConfig}
                                                requestSort={requestSortAdmin}
                                                className="w-[25%] px-3 py-3.5"
                                            >
                                                Start Time
                                            </AdminColumnHeader>
                                            <AdminColumnHeader
                                                sortKey="location"
                                                currentSort={sortConfig}
                                                requestSort={requestSortAdmin}
                                                className="hidden md:table-cell w-[20%] px-3 py-3.5"
                                            >
                                                Location
                                            </AdminColumnHeader>
                                            <AdminColumnHeader
                                                sortKey="actions"
                                                isActionOrSelect
                                                className="w-[15%] text-right pr-4 py-3.5"
                                            >
                                                Actions
                                            </AdminColumnHeader>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-800/70">
                                        {sortedFilteredEvents.length > 0 ? (
                                            sortedFilteredEvents.map(
                                                (
                                                    event: EventData // Typed event here
                                                ) => (
                                                    <TableRow
                                                        key={event.id}
                                                        className="hover:bg-gray-500/10 transition-colors group"
                                                    >
                                                        <TableCell className="pl-4 pr-2 py-3">
                                                            <Checkbox
                                                                aria-label={`Select event ${event.title}`}
                                                                checked={selectedEvents.includes(
                                                                    event.id
                                                                )}
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleCheckboxChange(
                                                                        event.id,
                                                                        !!checked
                                                                    )
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium text-gray-100 group-hover:text-white py-3 pr-3 truncate max-w-xs">
                                                            <Link
                                                                href={`/events/${event.id}`}
                                                                target="_blank"
                                                                className="hover:text-blue-400 hover:underline"
                                                                title={
                                                                    event.title
                                                                }
                                                            >
                                                                {event.title}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-gray-300 py-3 pr-3 whitespace-nowrap">
                                                            {new Date(
                                                                event.start_time
                                                            ).toLocaleString(
                                                                undefined,
                                                                {
                                                                    dateStyle:
                                                                        "medium",
                                                                    timeStyle:
                                                                        "short",
                                                                }
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300 py-3 pr-3 hidden md:table-cell truncate max-w-[200px]">
                                                            {event.location ||
                                                                "N/A"}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-1 py-3 pr-4">
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 rounded-full"
                                                            >
                                                                <Link
                                                                    href={`/admin/events/edit/${event.id}`}
                                                                >
                                                                    {" "}
                                                                    <Edit3
                                                                        size={
                                                                            16
                                                                        }
                                                                    />{" "}
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDeleteEvent(
                                                                        event.id,
                                                                        event.title
                                                                    )
                                                                }
                                                                className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-full"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell
                                                    colSpan={5}
                                                    className="h-32 text-center text-gray-400 text-lg"
                                                >
                                                    {searchQuery
                                                        ? "No events match your search."
                                                        : "No events to display."}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
