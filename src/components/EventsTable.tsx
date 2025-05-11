// src/components/EventsTable.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Assuming this is your shadcn/ui Button
import { Event as EventData } from "@/types/database";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowUpDown,
    ExternalLink as ExternalLinkIcon,
    Info,
    CalendarDays,
    MapPin as MapPinIcon,
    Clock,
} from "lucide-react";

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

const DialogDetailItem = ({
    icon: Icon,
    label,
    value,
    children,
}: {
    icon: React.ElementType;
    label: string;
    value?: React.ReactNode;
    children?: React.ReactNode;
}) => (
    <div className="flex items-start space-x-3">
        <Icon className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0 opacity-80" />
        <div>
            <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">
                {label}
            </span>
            {value && <div className="text-gray-100 mt-0.5">{value}</div>}
            {children && <div className="text-gray-100 mt-0.5">{children}</div>}
        </div>
    </div>
);

export default function EventsTable({ events }: Props) {
    const [selectedEventForDialog, setSelectedEventForDialog] =
        useState<EventData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof EventData;
        direction: "ascending" | "descending";
    } | null>({ key: "start_time", direction: "descending" });

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
                let valA_str = String(
                    valA_orig === null || valA_orig === undefined
                        ? ""
                        : valA_orig
                ).toLowerCase();
                let valB_str = String(
                    valB_orig === null || valB_orig === undefined
                        ? ""
                        : valB_orig
                ).toLowerCase();
                if (valA_str < valB_str)
                    return sortConfig.direction === "ascending" ? -1 : 1;
                if (valA_str > valB_str)
                    return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [events, sortConfig]);

    const requestSort = (key: keyof EventData) => {
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

    const formatDateForDialog = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="overflow-x-auto custom-scrollbar-thin rounded-xl border border-gray-700/50 bg-black/30">
            <table className="w-full min-w-[700px] table-fixed text-sm">
                <thead className="border-b border-gray-700/60 bg-black/60 backdrop-blur-md sticky top-0 z-10">
                    <tr>
                        <ColumnHeader
                            sortKey="title"
                            currentSort={sortConfig}
                            requestSort={requestSort}
                            className="w-[40%] pl-6 pr-3 py-4"
                        >
                            Title
                        </ColumnHeader>
                        <ColumnHeader
                            sortKey="start_time"
                            currentSort={sortConfig}
                            requestSort={requestSort}
                            className="w-[30%] px-3 py-4"
                        >
                            Date & Time
                        </ColumnHeader>
                        <ColumnHeader
                            sortKey="location"
                            currentSort={sortConfig}
                            requestSort={requestSort}
                            className="w-[20%] px-3 py-4"
                        >
                            Location
                        </ColumnHeader>
                        <th className="w-[10%] px-6 py-4 text-right font-medium text-gray-400">
                            Details
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                    {sortedEvents.map((event) => (
                        <motion.tr
                            key={event.id}
                            className="group hover:bg-gray-500/10 transition-colors duration-150"
                        >
                            <td className="pl-6 pr-3 py-3.5 text-gray-100 group-hover:text-white font-medium truncate">
                                <Link
                                    href={`/events/${event.id}`}
                                    className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 rounded inline-block"
                                >
                                    {event.title}
                                </Link>
                            </td>
                            <td className="px-3 py-3.5 text-gray-300 group-hover:text-gray-100 whitespace-nowrap">
                                {new Date(event.start_time).toLocaleString(
                                    undefined,
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    }
                                )}
                            </td>
                            <td className="px-3 py-3.5 text-gray-300 group-hover:text-gray-100 truncate">
                                {event.location || "N/A"}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-full"
                                    onClick={() => openEventDialog(event)}
                                    aria-label="View event quick details"
                                >
                                    <Info size={18} />
                                </Button>{" "}
                                {/* rounded-full */}
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-black/70 backdrop-blur-2xl border-gray-700/60 text-white rounded-2xl shadow-2xl p-0 outline-none max-h-[90vh] flex flex-col">
                    {/* Always render DialogHeader and DialogTitle, but content can be conditional */}
                    <div className={`px-6 pt-6 sm:px-8 sm:pt-8 pb-4 flex-shrink-0 ${selectedEventForDialog && !selectedEventForDialog.image_url ? 'rounded-t-2xl' : ''} ${selectedEventForDialog?.image_url ? '' : 'rounded-t-2xl'}`}> {/* Adjust conditional rounding if no image */}
                        <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                            {selectedEventForDialog ? selectedEventForDialog.title : "Event Details"} {/* Default title or selected event title */}
                        </DialogTitle>
                        {/* Optionally, a DialogDescription for accessibility */}
                        {selectedEventForDialog && (
                             <DialogDescription className="sr-only"> {/* sr-only to hide visually but available for screen readers */}
                                Details for {selectedEventForDialog.title}.
                                Starts at {formatDateForDialog(selectedEventForDialog.start_time)}.
                                Location: {selectedEventForDialog.location || "Not specified"}.
                            </DialogDescription>
                        )}
                    </div>

                    {/* Conditionally render the rest of the dialog body based on selectedEventForDialog */}
                    {selectedEventForDialog ? (
                        <>
                            {selectedEventForDialog.image_url && (
                                <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0"> {/* No top rounding here as header div handles it */}
                                    <img src={selectedEventForDialog.image_url} alt={selectedEventForDialog.title || "Event image"} className="w-full h-full object-cover"/>
                                </div>
                            )}
                            
                            {/* Metadata section moved into the conditional block, below the main persistent DialogTitle */}
                             <div className={`px-6 sm:px-8 ${selectedEventForDialog.image_url ? 'pt-4' : 'pt-0'} pb-4 flex-shrink-0 border-b border-gray-700/40`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-0"> {/* Reduced top margin */}
                                    <DialogDetailItem icon={CalendarDays} label="Starts" value={formatDateForDialog(selectedEventForDialog.start_time)} />
                                    {selectedEventForDialog.end_time && <DialogDetailItem icon={Clock} label="Ends" value={formatDateForDialog(selectedEventForDialog.end_time)} />}
                                    <DialogDetailItem icon={MapPinIcon} label="Location" value={selectedEventForDialog.location || "Not specified"} />
                                </div>
                            </div>


                            {/* Scrollable Description Area */}
                            {selectedEventForDialog.description && (
                                <div className="px-6 sm:px-8 pb-6 flex-grow overflow-y-auto custom-scrollbar-thin">
                                    <h3 className="text-lg font-semibold text-sky-300 mb-2 mt-2">Event Details</h3>
                                    <p className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
                                        {selectedEventForDialog.description}
                                    </p>
                                </div>
                            )}
                            {!selectedEventForDialog.description && (
                                 <div className="px-6 sm:px-8 pb-6 flex-grow flex items-center justify-center">
                                    <p className="text-gray-400 italic">No detailed description provided.</p>
                                 </div>
                            )}
                            
                            <DialogFooter className="px-6 py-4 bg-black/50 flex-shrink-0 rounded-b-2xl">
                                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-600 hover:bg-gray-700/50 text-gray-200 w-full sm:w-auto rounded-full">Close</Button>
                                    {selectedEventForDialog.external_id && selectedEventForDialog.source === "intra_42" && (
                                        <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white w-full sm:w-auto rounded-full">
                                            <a href={`https://intra.42.fr/events/${selectedEventForDialog.external_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">Intra <ExternalLinkIcon size={14} /></a>
                                        </Button>
                                    )}
                                    <Link href={`/events/${selectedEventForDialog.id}`} passHref legacyBehavior>
                                        <Button asChild className="bg-sky-600 hover:bg-sky-500 text-white w-full sm:w-auto rounded-full">
                                            <a className="flex items-center justify-center gap-1.5">Full Details <ExternalLinkIcon size={14} /></a>
                                        </Button>
                                    </Link>
                                </div>
                            </DialogFooter>
                        </>
                    ) : (
                        // Optional: Fallback content or a spinner if dialog is open but event is somehow null
                        // This case should ideally not happen if `openEventDialog` always sets `selectedEventForDialog`
                        <div className="p-8 text-center text-gray-400">Loading details...</div>
                    )}
                </DialogContent>
            </Dialog>
            {/* ... */}
        </div>
    );
}
