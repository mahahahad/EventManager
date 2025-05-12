// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import FullScreenBackground from "@/components/FullScreenBackground";
import { EventCalendar } from "@/components/ui/calendar"; // Your custom calendar
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Settings,
    LogOut,
    Star,
    ThumbsUp,
    Users,
    CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    UserProfile,
    Event,
    RegisteredEvent,
    PastEvent,
    UserEventRating,
} from "@/types/database";
import EventCardShared from "@/components/EventCard";

function cn(
    ...inputs: Array<
        string | undefined | null | false | Record<string, boolean>
    >
): string {
    return inputs
        .filter(Boolean)
        .map((input) =>
            typeof input === "object" && input !== null
                ? Object.keys(input)
                      .filter((key) => input[key])
                      .join(" ")
                : input
        )
        .join(" ");
}

const SkeletonPrimitive = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse rounded-md bg-gray-700/50", className)} />
);

const SkeletonEventCardPlaceholder = () => (
    <div className="bg-gray-800/60 backdrop-blur-sm p-5 rounded-2xl border border-gray-700/60 h-full flex flex-col">
        <SkeletonPrimitive className="h-5 w-3/4 mb-2" />{" "}
        <SkeletonPrimitive className="h-4 w-1/2 mb-1" />
        <SkeletonPrimitive className="h-4 w-1/2 mb-3" />{" "}
        <SkeletonPrimitive className="h-4 w-full mb-1" />
        <SkeletonPrimitive className="h-4 w-5/6 mb-3" />
        <SkeletonPrimitive className="h-12 w-full mt-auto py-1.5 rounded-full" />
    </div>
);

const SkeletonSmallEventListItem = () => (
    <div className="block p-3 rounded-md border border-transparent">
        <SkeletonPrimitive className="h-4 w-11/12 mb-2" />
        <SkeletonPrimitive className="h-3 w-3/4" />
    </div>
);

const SkeletonPastEventRatingCard = () => (
    <div className="p-4 rounded-lg border border-gray-700/60 bg-black/25">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
            <div>
                <SkeletonPrimitive className="h-5 w-48 mb-1.5" />
                <SkeletonPrimitive className="h-3 w-32" />
            </div>
            <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                {[...Array(5)].map((_, i) => (
                    <SkeletonPrimitive
                        key={i}
                        className="w-6 h-6 rounded-full"
                    />
                ))}
            </div>
        </div>
    </div>
);

const ButtonQuickAction = ({
    href,
    onClick,
    children,
    icon,
    variant,
    className,
}: {
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
    icon?: React.ReactNode;
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link"
        | null
        | undefined;
    className?: string;
}) => {
    const content = (
        <div className="flex items-center gap-2">
            {icon}
            {children}
        </div>
    );
    const buttonClasses = cn(
        "!p-4 rounded-full text-sm font-medium transition-colors",
        className,
        variant === "destructive" &&
            "bg-red-600/80 hover:bg-red-700/70 text-white",
        variant === "outline" &&
            "border border-gray-500 hover:border-gray-400 hover:bg-gray-700/30 text-gray-200",
        (!variant || variant === "default" || variant === "secondary") &&
            "bg-blue-600 hover:bg-blue-500 text-white"
    );
    if (href) {
        return (
            <Link href={href} passHref>
                <Button
                    variant={variant || "default"}
                    className={buttonClasses}
                    asChild
                >
                    {content}
                </Button>
            </Link>
        );
    }
    return (
        <Button
            variant={variant || "default"}
            onClick={onClick}
            className={buttonClasses}
        >
            {content}
        </Button>
    );
};

const DashboardSection = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10"
    >
        {/* MODIFIED Card: Removed background, backdrop-blur, shadow, and border for transparency */}
        {/* It now primarily acts as a structural container with a header */}
        <Card className="bg-transparent border-none shadow-none rounded-3xl">
            <CardHeader className="px-1 sm:px-2 md:px-0">
                {" "}
                {/* Adjusted padding for header if card is transparent */}
                <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                    {icon &&
                        React.isValidElement(icon) &&
                        React.cloneElement(
                            icon as React.ReactElement<{ size?: number }>,
                            { size: 24 }
                        )}
                    {title}
                </CardTitle>
            </CardHeader>
            {/* CardContent will just be a direct child, its padding can be handled by children or here if needed */}
            <CardContent className="pt-4 px-0">
                {" "}
                {/* Adjusted padding */}
                {children}
            </CardContent>
        </Card>
    </motion.section>
);

const DashboardSectionSkeleton = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <section className="mb-10">
        {/* Skeleton can retain some visual structure */}
        <Card className="bg-black/20 backdrop-blur-sm shadow-lg rounded-3xl border border-gray-700/40">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-white flex items-center gap-3">
                    {icon &&
                        React.isValidElement(icon) &&
                        React.cloneElement(
                            icon as React.ReactElement<{ size?: number }>,
                            { size: 24 }
                        )}
                    <SkeletonPrimitive className="h-7 w-1/2" />
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">{children}</CardContent>
        </Card>
    </section>
);

const SmallEventListItem = ({ event }: { event: Event }) => (
    <Link
        href={`/events/${event.id}`}
        className="block p-3 rounded-xl hover:bg-gray-700/50 border border-transparent hover:border-gray-600/70 transition-all group"
    >
        <h4 className="font-medium text-sm text-gray-100 group-hover:text-sky-300 truncate">
            {event.title}
        </h4>
        <p className="text-xs text-gray-400 flex items-center mt-0.5">
            <Clock className="w-3 h-3 mr-1.5 flex-shrink-0" />
            {new Date(event.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
            {event.location && (
                <>
                    <MapPin className="w-3 h-3 ml-2 mr-1 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                </>
            )}
        </p>
    </Link>
);

const PastEventRatingCard = ({
    event,
    initialRating,
    onRate,
}: {
    event: PastEvent;
    initialRating?: number | null;
    onRate: (eventId: string, rating: number, comment?: string) => void;
}) => {
    const [currentRating, setCurrentRating] = useState(initialRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const handleSetRating = (rating: number) => {
        setCurrentRating(rating);
        if (rating > 0) onRate(event.id, rating);
    };
    return (
        <div className="p-4 rounded-2xl border border-gray-700/60 bg-black/25 hover:border-gray-600 transition-all">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                <div className="mb-2 sm:mb-0">
                    <h4 className="font-semibold text-md text-gray-100 hover:text-sky-300 transition-colors">
                        <Link href={`/events/${event.id}`}>{event.title}</Link>
                    </h4>
                    <p className="text-xs text-gray-400">
                        Attended:{" "}
                        {new Date(event.start_time).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            aria-label={`Rate ${star} stars`}
                            onClick={() => handleSetRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-transform hover:scale-110"
                        >
                            <ThumbsUp
                                className={cn(
                                    "w-5 h-5 transition-all duration-150 ease-in-out",
                                    (hoverRating || currentRating) >= star
                                        ? "text-yellow-400 fill-yellow-400/30"
                                        : "text-gray-500 hover:text-gray-400"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
            {currentRating > 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                    Your rating: {currentRating} star
                    {currentRating > 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
};

const DashboardPage = () => {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [myRegisteredEvents, setMyRegisteredEvents] = useState<
        RegisteredEvent[]
    >([]);
    const [myPastAttendedEvents, setMyPastAttendedEvents] = useState<
        PastEvent[]
    >([]);
    const [userRatings, setUserRatings] = useState<UserEventRating[]>([]);
    const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );
    const [loading, setLoading] = useState(true);

    const processEventData = (dbEvent: any): Event => {
        const { event_tags, ...eventCoreProps } = dbEvent;
        return {
            ...eventCoreProps,
            tags: Array.isArray(event_tags)
                ? (event_tags
                      .map((et: any) => et.tags?.name)
                      .filter(Boolean) as string[])
                : [],
            event_tags: Array.isArray(event_tags) ? event_tags : [],
        };
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const todayISO = new Date().toISOString();
            const { data: authData, error: authError } =
                await supabase.auth.getUser();
            if (authError || !authData.user) {
                router.push("/login");
                return;
            }
            const userId = authData.user.id;

            const { data: userProfileData, error: profileError } =
                await supabase
                    .from("users")
                    .select("id, display_name, is_admin")
                    .eq("id", userId)
                    .single();
            if (profileError)
                console.error("Error fetching user profile:", profileError);
            else setUserProfile(userProfileData as UserProfile);

            const { data: upcomingEventsData, error: upcomingError } =
                await supabase
                    .from("events")
                    .select("*, event_tags(tags(id, name))")
                    .gte("start_time", todayISO)
                    .order("start_time", { ascending: true });
            if (upcomingError)
                console.error("Error fetching upcoming events:", upcomingError);
            else
                setUpcomingEvents(
                    (upcomingEventsData || [])
                        .filter(Boolean)
                        .map(processEventData)
                );

            const { data: registeredData, error: registeredError } =
                await supabase
                    .from("event_registrations")
                    .select(
                        "registration_time, attended, event:events!inner(*, event_tags(tags(id,name)))"
                    )
                    .eq("user_id", userId)
                    .gte("event.start_time", todayISO);
            if (registeredError)
                console.error(
                    "Error fetching registered events:",
                    registeredError
                );
            else {
                const processedRegistered = (registeredData || []).map(
                    (reg: any) => ({
                        ...processEventData(reg.event),
                        registration_time: reg.registration_time,
                        attended: reg.attended,
                    })
                );
                setMyRegisteredEvents(processedRegistered as RegisteredEvent[]);
            }

            let localUserRatings: UserEventRating[] = [];
            const { data: allUserRatingsData, error: allUserRatingsError } =
                await supabase
                    .from("user_event_ratings")
                    .select("event_id, rating, comment")
                    .eq("user_id", userId);
            if (allUserRatingsError)
                console.error(
                    "Error fetching all user ratings:",
                    allUserRatingsError
                );
            else {
                localUserRatings = (allUserRatingsData || []).filter(
                    Boolean
                ) as UserEventRating[];
                setUserRatings(localUserRatings);
            }

            const { data: pastAttendedData, error: pastAttendedError } =
                await supabase
                    .from("event_registrations")
                    .select(
                        "attended, event:events!inner(*, event_tags(tags(id,name)))"
                    )
                    .eq("user_id", userId)
                    .eq("attended", true)
                    .lt("event.start_time", todayISO);
            if (pastAttendedError)
                console.error(
                    "Error fetching past attended events:",
                    pastAttendedError
                );
            else {
                const processedPast = (pastAttendedData || [])
                    .filter(Boolean)
                    .map((reg: any) => ({
                        ...processEventData(reg.event),
                        attended: reg.attended,
                        user_rating:
                            localUserRatings.find(
                                (r) => r.event_id === reg.event.id
                            )?.rating || null,
                    }));
                setMyPastAttendedEvents(processedPast as PastEvent[]);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, [router]);

    useEffect(() => {
        if (loading) return;
        if (!userProfile || !upcomingEvents.length) {
            const nonRegisteredUpcoming = upcomingEvents.filter(
                (upe) => !myRegisteredEvents.some((myre) => myre.id === upe.id)
            );
            setRecommendedEvents(nonRegisteredUpcoming.slice(0, 3));
            return;
        }
        const positiveRatingThreshold = 4;
        const preferredTags = new Map<string, number>();
        myPastAttendedEvents.forEach((event) => {
            const ratingInfo = userRatings.find((r) => r.event_id === event.id);
            if (ratingInfo && ratingInfo.rating >= positiveRatingThreshold) {
                event.tags?.forEach((tag) => {
                    preferredTags.set(tag, (preferredTags.get(tag) || 0) + 1);
                });
            }
        });
        if (preferredTags.size === 0 && upcomingEvents.length > 0) {
            const nonRegisteredUpcoming = upcomingEvents.filter(
                (upe) => !myRegisteredEvents.some((myre) => myre.id === upe.id)
            );
            setRecommendedEvents(nonRegisteredUpcoming.slice(0, 3));
            return;
        }
        if (preferredTags.size === 0 && upcomingEvents.length === 0) {
            setRecommendedEvents([]);
            return;
        }
        const recommendations = [...upcomingEvents]
            .filter(
                (upe) => !myRegisteredEvents.some((myre) => myre.id === upe.id)
            )
            .map((event) => {
                let score = 0;
                event.tags?.forEach((tag) => {
                    if (preferredTags.has(tag))
                        score += preferredTags.get(tag)!;
                });
                return { ...event, recommendationScore: score };
            })
            .filter((event) => event.recommendationScore > 0)
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 5);
        if (recommendations.length < 3) {
            const nonRegisteredUpcoming = upcomingEvents
                .filter(
                    (upe) =>
                        !myRegisteredEvents.some((myre) => myre.id === upe.id)
                )
                .filter(
                    (upe) => !recommendations.some((rec) => rec.id === upe.id)
                );
            setRecommendedEvents([
                ...recommendations,
                ...nonRegisteredUpcoming.slice(
                    0,
                    Math.max(0, 3 - recommendations.length)
                ),
            ]);
        } else {
            setRecommendedEvents(recommendations);
        }
    }, [
        loading,
        userProfile,
        upcomingEvents,
        myPastAttendedEvents,
        userRatings,
        myRegisteredEvents,
    ]);

    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate || loading) return [];
        return upcomingEvents.filter(
            (event) =>
                new Date(event.start_time).toDateString() ===
                selectedDate.toDateString()
        );
    }, [upcomingEvents, selectedDate, loading]);

    const handleRateEvent = async (
        eventId: string,
        rating: number,
        comment?: string
    ) => {
        if (!userProfile) return;
        const { error } = await supabase
            .from("user_event_ratings")
            .upsert(
                { user_id: userProfile.id, event_id: eventId, rating, comment },
                { onConflict: "user_id, event_id" }
            );
        if (error) {
            alert("Error submitting rating: " + error.message);
        } else {
            setUserRatings((prev) => {
                const existingIndex = prev.findIndex(
                    (r) => r.event_id === eventId
                );
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        rating,
                        comment: comment || updated[existingIndex].comment,
                    };
                    return updated;
                }
                return [
                    ...prev,
                    {
                        event_id: eventId,
                        rating,
                        comment: comment || null,
                        user_id: userProfile.id,
                        id: "",
                        rated_at: new Date().toISOString(),
                    } as UserEventRating,
                ];
            });
            setMyPastAttendedEvents((prev) =>
                prev.map((e) =>
                    e.id === eventId ? { ...e, user_rating: rating } : e
                )
            );
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <SkeletonPrimitive className="h-10 w-1/2 sm:w-1/3 mb-10" />
                    <section className="bg-black/20 backdrop-blur-md shadow-lg rounded-3xl p-4 mb-10 border border-gray-700/40">
                        <div className="flex flex-wrap items-center gap-3">
                            <SkeletonPrimitive className="h-12 w-40 rounded-full" />
                            <SkeletonPrimitive className="h-12 w-32 rounded-full ml-auto" />
                        </div>
                    </section>
                    <DashboardSectionSkeleton
                        title="Recommended For You"
                        icon={<Star className="text-yellow-400" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonEventCardPlaceholder key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-10">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-3xl border border-gray-700/50">
                                <CardHeader>
                                    <CardTitle>
                                        <SkeletonPrimitive className="h-6 w-3/5" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 sm:p-4">
                                    <SkeletonPrimitive className="h-64 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-3xl border border-gray-700/50">
                                <CardHeader>
                                    <CardTitle>
                                        <SkeletonPrimitive className="h-6 w-4/5" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar p-1 pr-3">
                                    {[...Array(3)].map((_, i) => (
                                        <SkeletonSmallEventListItem key={i} />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                    <DashboardSectionSkeleton
                        title="My Upcoming Registered Events"
                        icon={<CheckCircle className="text-blue-400" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...Array(1)].map((_, i) => (
                                <SkeletonEventCardPlaceholder key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>
                    <DashboardSectionSkeleton
                        title="Rate Your Past Events"
                        icon={<ThumbsUp className="text-green-400" />}
                    >
                        <div className="space-y-4">
                            {[...Array(1)].map((_, i) => (
                                <SkeletonPastEventRatingCard key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>
                </>
            );
        }

        return (
            <>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300"
                >
                    {userProfile?.display_name
                        ? `Welcome back, ${userProfile.display_name}!`
                        : "Your Dashboard"}
                </motion.h1>
                <motion.section
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className=" rounded-full py-2 mb-10"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <ButtonQuickAction
                            icon={<CalendarIcon className="w-4 h-4" />}
                            href="/events"
                            variant="outline"
                        >
                            All Events
                        </ButtonQuickAction>
                        {userProfile?.is_admin && (
                            <ButtonQuickAction
                                icon={<Settings className="w-4 h-4" />}
                                href="/admin"
                                variant="outline"
                            >
                                Admin Panel
                            </ButtonQuickAction>
                        )}
                        <ButtonQuickAction
                            icon={<LogOut className="w-4 h-4" />}
                            onClick={() =>
                                supabase.auth
                                    .signOut()
                                    .then(() => router.push("/login"))
                            }
                            variant="destructive"
                            className="ml-auto"
                        >
                            Log Out
                        </ButtonQuickAction>
                    </div>
                </motion.section>
                {recommendedEvents.length > 0 && (
                    <DashboardSection
                        title="Recommended For You"
                        icon={<Star className="text-yellow-400 w-6 h-6" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {recommendedEvents.map((event) => (
                                <EventCardShared
                                    key={event.id}
                                    event={event}
                                    onOpenDialog={() =>
                                        router.push(`/events/${event.id}`)
                                    }
                                />
                            ))}
                        </div>
                    </DashboardSection>
                )}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-10">
                    <motion.div
                        className="lg:col-span-1 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-3xl border border-gray-700/50 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    Event Calendar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 sm:p-4">
                                <EventCalendar
                                    events={upcomingEvents.map(
                                        (e) =>
                                            ({
                                                ...e,
                                                date: new Date(e.start_time),
                                            } as any)
                                    )}
                                    onDateSelect={setSelectedDate}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-3xl border border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    {selectedDate
                                        ? `Events for ${selectedDate.toLocaleDateString(
                                              undefined,
                                              { month: "long", day: "numeric" }
                                          )}`
                                        : "Select a Date"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar p-4">
                                {eventsForSelectedDate.length > 0 ? (
                                    eventsForSelectedDate.map((event) => (
                                        <SmallEventListItem
                                            key={event.id}
                                            event={event}
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        No events for this date.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>
                {myRegisteredEvents.length > 0 && (
                    <DashboardSection
                        title="My Upcoming Registered Events"
                        icon={<CheckCircle className="text-blue-400 w-6 h-6" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {myRegisteredEvents.map((event) => (
                                <EventCardShared
                                    
                                    key={event.id}
                                    event={event as Event}
                                    onOpenDialog={() =>
                                        router.push(`/events/${event.id}`)
                                    }
                                />
                            ))}
                        </div>
                    </DashboardSection>
                )}
                {myPastAttendedEvents.length > 0 && (
                    <DashboardSection
                        title="Rate Your Past Events"
                        icon={<ThumbsUp className="text-green-400 w-6 h-6" />}
                    >
                        <div className="space-y-4">
                            {myPastAttendedEvents.map((event) => (
                                <PastEventRatingCard
                                    key={event.id}
                                    event={event}
                                    initialRating={event.user_rating}
                                    onRate={handleRateEvent}
                                />
                            ))}
                        </div>
                    </DashboardSection>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            <FullScreenBackground darkOverlay={true} />
            <Navbar />
            <main className="relative z-10 w-full max-w-7xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8 space-y-10 mt-20 sm:mt-24">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardPage;
