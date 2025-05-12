// components/EventDialog.tsx
"use client";

import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter,
} from "@/components/ui/dialog"; // Assuming these are from shadcn/ui
import { Button } from "@/components/ui/button";
import { Event as EventData } from "@/types/database";
import Link from "next/link";
import Image from "next/image";
import { 
    ExternalLink as ExternalLinkIcon, 
    CalendarDays, 
    MapPin as MapPinIcon, 
    Clock,
    Tag as TagIcon // Using Lucide's Tag icon
} from "lucide-react";

interface EventDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    event: EventData | null;
}

const DialogDetailItem = ({ 
    icon: Icon, 
    label, 
    value, 
    children 
}: { 
    icon: React.ElementType; 
    label: string; 
    value?: React.ReactNode; 
    children?: React.ReactNode; 
}) => (
    <div className="flex items-start space-x-3">
        <Icon className="w-4 h-4 text-sky-400 mt-1 flex-shrink-0 opacity-80" />
        <div>
            <span className="font-medium text-gray-400 text-xs uppercase tracking-wider">{label}</span>
            {value && <div className="text-gray-100 mt-0.5">{value}</div>}
            {children && <div className="text-gray-100 mt-0.5">{children}</div>}
        </div>
    </div>
);

const formatDateForDialog = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString(undefined, {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });
};

const EventDialog: React.FC<EventDialogProps> = ({ isOpen, onOpenChange, event }) => {
    if (!event) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-black/80 backdrop-blur-2xl border-gray-700/60 text-white rounded-3xl shadow-2xl p-0 outline-none max-h-[90vh] flex flex-col"> {/* Increased to rounded-3xl */}
                <div className={`px-6 pt-6 sm:px-8 sm:pt-8 pb-4 flex-shrink-0 ${!event.image_url ? "rounded-t-3xl" : ""}`}> {/* Matched rounding */}
                    <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300">
                        {event.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Details for {event.title}. Starts at {formatDateForDialog(event.start_time)}. Location: {event.location || "Not specified"}.
                    </DialogDescription>
                </div>

                {event.image_url && (
                    <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0">
                        <Image src={event.image_url} alt={event.title || "Event image"} layout="fill" objectFit="cover" />
                    </div>
                )}

                <div className={`px-6 sm:px-8 ${event.image_url ? "pt-4" : "pt-0"} pb-4 flex-shrink-0 border-b border-gray-700/40`}> {/* Kept this border for separation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-0">
                        <DialogDetailItem icon={CalendarDays} label="Starts" value={formatDateForDialog(event.start_time)} />
                        {event.end_time && (
                            <DialogDetailItem icon={Clock} label="Ends" value={formatDateForDialog(event.end_time)} />
                        )}
                        <DialogDetailItem icon={MapPinIcon} label="Location" value={event.location || "Not specified"} />
                        {event.event_tags && event.event_tags.length > 0 && (
                            <DialogDetailItem icon={TagIcon} label="Tags"> {/* Used TagIcon */}
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                    {event.event_tags.map((et, index) => (
                                        et.tags && et.tags.name ? (
                                            <span
                                                key={index}
                                                className="text-xs bg-purple-600/40 text-purple-200 px-2.5 py-1 rounded-full"
                                            >
                                                {et.tags.name}
                                            </span>
                                        ) : null
                                    ))}
                                </div>
                            </DialogDetailItem>
                        )}
                    </div>
                </div>

                {event.description && (
                    <div className="px-6 sm:px-8 py-4 flex-grow overflow-y-auto custom-scrollbar-thin"> {/* py-4 instead of separate mt/mb on h3/p */}
                        <h3 className="text-lg font-semibold text-sky-300 mb-2">Event Details</h3> {/* Removed mt-2 */}
                        <p className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
                            {event.description}
                        </p>
                    </div>
                )}
                {!event.description && (
                     <div className="px-6 sm:px-8 py-6 flex-grow flex items-center justify-center">
                         <p className="text-gray-400 italic">No detailed description provided for this event.</p>
                     </div>
                )}

                <DialogFooter className="px-6 py-4 bg-black/60 backdrop-blur-sm flex-shrink-0 rounded-b-3xl"> {/* Removed border-t, matched rounding */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-600 mr-auto !p-6 hover:bg-gray-700/50 text-gray-200 w-full sm:w-auto rounded-full" // !p-4 and rounded-full
                        >
                            Close
                        </Button>
                        {event.external_id && event.source === "intra_42" && (
                            <Button
                                asChild
                                className="bg-blue-600 !p-6 hover:bg-blue-500 text-white w-full sm:w-auto rounded-full" // !p-4 and rounded-full
                            >
                                <a
                                    href={`https://intra.42.fr/events/${event.external_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5"
                                >
                                    View on Intra <ExternalLinkIcon size={14} />
                                </a>
                            </Button>
                        )}
                        <Button
                            asChild
                            className="bg-sky-600 !p-6 hover:bg-sky-500 text-white w-full sm:w-auto rounded-full" // !p-4 and rounded-full
                        >
                            <Link
                                href={`/events/${event.id}`}
                                className="flex items-center justify-center gap-1.5"
                            >
                                Full Event Page <ExternalLinkIcon size={14} />
                            </Link>
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EventDialog;
