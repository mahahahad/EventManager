// components/EventCard.tsx
import { Event as EventData } from "@/types/database";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowRight, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShimmerBorderCard from "@/components/ui/ShimmerBorderCard";

interface EventCardProps {
    event: EventData;
    onOpenDialog: (event: EventData) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onOpenDialog }) => {
    const eventDate = new Date(event.start_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
    const eventTime = new Date(event.start_time).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <ShimmerBorderCard
            className="h-full flex flex-col text-left bg-black/30" // Added text-left for ShimmerBorderCard's content
            contentClassName="flex flex-col flex-grow p-5"
            borderRadius="1.5rem"
            borderWidth="3px"
            defaultBorderWidth="1px"
            defaultBorderColor="rgba(100, 100, 120, 0.15)"
            shimmerSize="400px"
            proximityThreshold={280}
            maxProximityOpacity={0.5}
            backgroundOpacity={0.08}
            gradientColors={["#8f28D922", "#4C1D9533", "transparent"]} // Slightly adjusted purple for visibility
        >
            {event.image_url && (
                <div className="relative w-full h-40 flex-shrink-0 mb-4">
                    <Image
                        src={event.image_url}
                        alt={event.title || "Event"}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="flex flex-col flex-grow">
                {" "}
                {/* Main content flex column */}
                <h3
                    className="text-lg font-semibold text-white mb-1.5 group-hover:text-sky-300 transition-colors text-left" // Ensure text-left
                    title={event.title}
                >
                    {event.title}
                </h3>
                {/* Event Tags moved here, below the title */}
                {event.event_tags && event.event_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-2">
                        {" "}
                        {/* my-2 for spacing */}
                        {event.event_tags.map((et, index) =>
                            et.tags && et.tags.name ? (
                                <span
                                    key={index}
                                    className="text-xs bg-purple-600/40 text-purple-200 px-2.5 py-1 rounded-full"
                                >
                                    {et.tags.name}
                                </span>
                            ) : null
                        )}
                    </div>
                )}
                <div className="flex items-center text-gray-400 text-xs mt-1 mb-1 text-left">
                    {" "}
                    {/* mt-1 added */}
                    <CalendarDays
                        size={14}
                        className="mr-1.5 text-sky-400 flex-shrink-0"
                    />
                    {eventDate} - {eventTime}
                </div>
                <div className="flex items-center text-gray-400 text-xs mb-3 truncate text-left">
                    <MapPin
                        size={14}
                        className="mr-1.5 text-sky-400 flex-shrink-0"
                    />
                    {event.location || "N/A"}
                </div>
                <p className="text-gray-300 text-sm line-clamp-3 mb-4 flex-grow text-left">
                    {event.description?.substring(0, 120) +
                        (event.description && event.description.length > 120
                            ? "..."
                            : "") || "Click to see more details."}
                </p>
            </div>

            <div className="mt-auto pt-2">
                <Button
                    onClick={() => onOpenDialog(event)}
                    variant="outline"
                    className="w-full text-white border-sky-500/70 hover:bg-sky-500/20 hover:text-sky-200 transition-colors text-sm !p-5 rounded-full" // Changed to rounded-full
                >
                    View Details{" "}
                    <ArrowRight
                        size={16}
                        className="ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                </Button>
            </div>
        </ShimmerBorderCard>
    );
};

export const EventCardSkeleton = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl shadow-lg p-5 animate-pulse min-h-[320px] border border-gray-700/50 text-left">
        {" "}
        {/* Added text-left */}
        <div className="h-40 bg-gray-700/50 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-2.5"></div>{" "}
        {/* Default left align */}
        <div className="h-4 bg-gray-700/50 rounded w-1/2 mb-1.5"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-full mb-1.5"></div>
        <div className="h-4 bg-gray-700/50 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-700/50 rounded-lg mt-auto"></div>
    </div>
);

export default EventCard;
