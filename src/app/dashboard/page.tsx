// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust path as needed
import Navbar from "@/components/Navbar"; // Adjust path as needed
import FullScreenBackground from "@/components/FullScreenBackground"; // Adjust path as needed
import { EventCalendar } from "@/components/ui/calendar"; // Adjust path as needed
import { Button } from "@/components/ui/button"; // Adjust path as needed
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"; // Adjust path as needed
import { Badge } from "@/components/ui/badge"; // Adjust path as needed
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ExternalLink,
    Settings,
    PlusCircle,
    ListChecks,
    LogOut,
    Star,
    ThumbsUp,
    Users,
    CheckCircle,
    SearchIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    UserProfile,
    Tag,
    Event,
    RegisteredEvent,
    PastEvent,
    UserEventRating,
} from "@/types/database";

// cn utility function (standard in shadcn/ui projects)
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

// --- Skeleton Primitive ---
const SkeletonPrimitive = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse rounded-md bg-gray-700/50", className)} />
);

// --- Specific Skeleton Components ---
const SkeletonEventCard = () => (
    <div className="bg-gray-800/60 backdrop-blur-sm p-4 rounded-lg border border-gray-700/60 h-full flex flex-col">
        <SkeletonPrimitive className="h-5 w-3/4 mb-2" /> {/* Title */}
        <SkeletonPrimitive className="h-4 w-1/2 mb-3" /> {/* Date/Time */}
        <SkeletonPrimitive className="h-4 w-full mb-1" />{" "}
        {/* Description line 1 */}
        <SkeletonPrimitive className="h-4 w-5/6 mb-3" />{" "}
        {/* Description line 2 */}
        <div className="flex flex-wrap gap-1 mb-3">
            <SkeletonPrimitive className="h-5 w-12 px-1.5 py-0.5" />
            <SkeletonPrimitive className="h-5 w-16 px-1.5 py-0.5" />
        </div>
        <SkeletonPrimitive className="h-9 w-full mt-auto py-1.5" />{" "}
        {/* Button */}
    </div>
);

const SkeletonSmallEventListItem = () => (
    <div className="block p-3 rounded-md border border-transparent">
        <SkeletonPrimitive className="h-4 w-11/12 mb-2" /> {/* Title */}
        <SkeletonPrimitive className="h-3 w-3/4" /> {/* Time/Location */}
    </div>
);

const SkeletonPastEventRatingCard = () => (
    <div className="p-4 rounded-lg border border-gray-700/60 bg-black/25">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
            <div>
                <SkeletonPrimitive className="h-5 w-48 mb-1.5" /> {/* Title */}
                <SkeletonPrimitive className="h-3 w-32" /> {/* Date */}
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

            // 1. Fetch User Profile
            const { data: userProfileData, error: profileError } =
                await supabase
                    .from("users")
                    .select("id, display_name, is_admin")
                    .eq("id", userId)
                    .single();
            if (profileError)
                console.error("Error fetching user profile:", profileError);
            else setUserProfile(userProfileData as UserProfile);

            // 2. Fetch All Upcoming Events
            const { data: upcomingEventsData, error: upcomingError } =
                await supabase
                    .from("events")
                    .select("*, event_tags(tags(id, name))")
                    .gte("start_time", todayISO)
                    .order("start_time", { ascending: true });

            if (upcomingError)
                console.error("Error fetching upcoming events:", upcomingError);
            else {
                const processedEvents = (upcomingEventsData || [])
                    .filter((dbEvent) => dbEvent !== null)
                    .map((dbEvent: any) => {
                        const { event_tags, ...eventCoreProps } = dbEvent;
                        return {
                            ...eventCoreProps,
                            tags:
                                ((event_tags as any[])
                                    ?.map((et) => et.tags?.name)
                                    .filter(Boolean) as string[]) || [],
                        };
                    });
                setUpcomingEvents(processedEvents as Event[]);
            }

            // 3. Fetch User's Registered Upcoming Events
            const { data: registeredData, error: registeredError } =
                await supabase
                    .from("event_registrations")
                    .select(
                        "registration_time, attended, event:events(*, event_tags(tags(id,name)))"
                    )
                    .eq("user_id", userId)
                    .gte("events.start_time", todayISO);

            if (registeredError)
                console.error(
                    "Error fetching registered events:",
                    registeredError
                );
            else {
                const processedRegistered = (registeredData || [])
                    .filter((reg: any) => reg && reg.event)
                    .map((reg: any) => {
                        const { event_tags, ...eventCoreProps } = reg.event;
                        return {
                            ...eventCoreProps,
                            tags:
                                ((event_tags as any[])
                                    ?.map((et: any) => et.tags?.name)
                                    .filter(Boolean) as string[]) || [],
                            registration_time: reg.registration_time,
                            attended: reg.attended,
                        };
                    });
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
                localUserRatings =
                    (allUserRatingsData as UserEventRating[]) || [];
                setUserRatings(localUserRatings);
            }

            const { data: pastAttendedData, error: pastAttendedError } =
                await supabase
                    .from("event_registrations")
                    .select(
                        "attended, event:events(*, event_tags(tags(id,name)))"
                    )
                    .eq("user_id", userId)
                    .eq("attended", true)
                    .lt("events.start_time", todayISO);

            if (pastAttendedError) {
                console.error(
                    "Error fetching past attended events:",
                    pastAttendedError
                );
                if (pastAttendedError.message) {
                    console.error(
                        "Supabase error details:",
                        pastAttendedError.message,
                        pastAttendedError.details,
                        pastAttendedError.hint
                    );
                }
            } else {
                const processedPast = (pastAttendedData || [])
                    .filter((reg: any) => reg && reg.event)
                    .map((reg: any) => {
                        const { event_tags, ...eventCoreProps } = reg.event;
                        const ratingInfo = localUserRatings.find(
                            (r) => r.event_id === eventCoreProps.id
                        );
                        return {
                            ...eventCoreProps,
                            tags:
                                ((event_tags as any[])
                                    ?.map((et: any) => et.tags?.name)
                                    .filter(Boolean) as string[]) || [],
                            attended: reg.attended,
                            user_rating: ratingInfo ? ratingInfo.rating : null,
                        };
                    });
                setMyPastAttendedEvents(processedPast as PastEvent[]);
            }

            setLoading(false);
        };

        fetchDashboardData();
    }, [router]);

    // --- Event Recommendation Logic ---
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

        if (preferredTags.size === 0) {
            const nonRegisteredUpcoming = upcomingEvents.filter(
                (upe) => !myRegisteredEvents.some((myre) => myre.id === upe.id)
            );
            setRecommendedEvents(nonRegisteredUpcoming.slice(0, 3));
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
                ...nonRegisteredUpcoming.slice(0, 3 - recommendations.length),
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

    // --- Memoized values for display ---
    const eventsForSelectedDate = useMemo(() => {
        if (!selectedDate || loading) return [];
        return upcomingEvents.filter(
            (event) =>
                new Date(event.start_time).toDateString() ===
                selectedDate.toDateString()
        );
    }, [upcomingEvents, selectedDate, loading]);

    // --- Event Handler for Rating ---
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
            alert("Rating submitted successfully!");
            setUserRatings((prev) => {
                const existing = prev.find((r) => r.event_id === eventId);
                if (existing)
                    return prev.map((r) =>
                        r.event_id === eventId ? { ...r, rating, comment } : r
                    );
                return [
                    ...prev,
                    {
                        event_id: eventId,
                        rating,
                        comment: comment || null,
                        user_id: userProfile.id,
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

    // --- Render Skeletons or Actual Content ---
    const renderContent = () => {
        if (loading) {
            return (
                <>
                    {/* Skeleton Welcome Header */}
                    <SkeletonPrimitive className="h-10 w-1/2 sm:w-1/3 mb-10" />

                    {/* Skeleton Quick Actions Section - Adjusted */}
                    <section className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50 p-4 mb-10">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Assuming "My Events" might still be shown, or remove if not */}
                            {/* <SkeletonPrimitive className="h-9 w-28" />  */}
                            {/* Admin button placeholder, Log Out placeholder */}
                            <SkeletonPrimitive className="h-9 w-36" />{" "}
                            {/* Placeholder for Admin or other first button */}
                            <SkeletonPrimitive className="h-9 w-24 ml-auto" />{" "}
                            {/* Log Out always last */}
                        </div>
                    </section>

                    {/* Skeleton Recommended Events Section (show 3 cards) */}
                    <DashboardSectionSkeleton
                        title="Recommended For You"
                        icon={<Star className="text-yellow-400" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonEventCard key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>

                    {/* Skeleton Calendar and Events for Selected Date */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-10">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
                                <CardHeader>
                                    <CardTitle>
                                        <SkeletonPrimitive className="h-6 w-3/5" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 sm:p-4">
                                    <SkeletonPrimitive className="h-64 w-full" />{" "}
                                    {/* Calendar Placeholder */}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
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
                            {[...Array(2)].map((_, i) => (
                                <SkeletonEventCard key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>

                    <DashboardSectionSkeleton
                        title="Rate Your Past Events"
                        icon={<ThumbsUp className="text-green-400" />}
                    >
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <SkeletonPastEventRatingCard key={i} />
                            ))}
                        </div>
                    </DashboardSectionSkeleton>
                </>
            );
        }

        // Actual Content
        return (
            <>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300"
                >
                    {userProfile?.display_name
                        ? `Welcome back, ${userProfile.display_name}!`
                        : "Your Dashboard"}
                </motion.h1>

                {/* Quick Actions Section - Conditionally Rendered or Modified */}
                {/* Option 1: Only show bar for admins (contains Admin Dashboard & Log Out) */}
                {userProfile?.is_admin && (
                    <motion.section
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl  "
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <ButtonQuickAction
                                icon={
                                    <CalendarIcon className="w-4 h-4 rounded-2xl" />
                                }
                                href="/events"
                                variant="outline"
                            >
                                View All Events
                            </ButtonQuickAction>
                            <ButtonQuickAction
                                icon={
                                    <Settings className="w-4 h-4 rounded-2xl bg-blue" />
                                }
                                href="/admin"
                                variant="outline"
                            >
                                Admin Dashboard
                            </ButtonQuickAction>
                            {/* You could add "Create Event" here again if admins also use this page to create */}
                            {/* <ButtonQuickAction
                                icon={<PlusCircle className="w-4 h-4" />}
                                href="/events/create"
                            >
                                Create Event
                            </ButtonQuickAction> */}
                            <ButtonQuickAction
                                icon={<LogOut className="w-4 h-4" />}
                                onClick={() =>
                                    supabase.auth
                                        .signOut()
                                        .then(() => router.push("/login"))
                                }
                                className="ml-auto" // This will push Log Out to the right if it's the only other item
                                variant="destructive"
                            >
                                Log Out
                            </ButtonQuickAction>
                        </div>
                    </motion.section>
                )}

                {/* Option 2: Always show Log Out, and Admin Dashboard if admin */}
                {/* This might be cleaner if the bar feels too empty for non-admins */}
                {!userProfile?.is_admin && (
                    <motion.section
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50 p-4"
                    >
                        <div className="flex flex-wrap items-center gap-3 justify-end">
                            {" "}
                            {/* justify-end to push logout right */}
                            <ButtonQuickAction
                                icon={<LogOut className="w-4 h-4" />}
                                onClick={() =>
                                    supabase.auth
                                        .signOut()
                                        .then(() => router.push("/login"))
                                }
                            >
                                Log Out
                            </ButtonQuickAction>
                        </div>
                    </motion.section>
                )}

                {/* Recommended Events Section */}
                {recommendedEvents.length > 0 && (
                    <DashboardSection
                        title="Recommended For You"
                        icon={<Star className="text-yellow-400" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {recommendedEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </DashboardSection>
                )}

                {/* Calendar and Events for Selected Date */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <motion.div
                        className="lg:col-span-1 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-white">
                                    Event Calendar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 sm:p-4">
                                <EventCalendar
                                    events={upcomingEvents.map((e) => ({
                                        ...e,
                                        date: new Date(e.start_time),
                                    }))}
                                    onDateSelect={setSelectedDate}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
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
                            <CardContent className="max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar px-4">
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
                        icon={<CheckCircle className="text-blue-400" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {myRegisteredEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event as Event}
                                />
                            ))}
                        </div>
                    </DashboardSection>
                )}

                {myPastAttendedEvents.length > 0 && (
                    <DashboardSection
                        title="Rate Your Past Events"
                        icon={<ThumbsUp className="text-green-400" />}
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
        <div className="relative min-h-screen text-white bg-black overflow-x-hidden">
            <FullScreenBackground />
            <Navbar />
            <main className="relative z-10 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 mt-20 sm:mt-24">
                {renderContent()}
            </main>
        </div>
    );
};

// --- Helper Components ---

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
        <div className={cn("flex items-center gap-2", className)}>
            {icon}
            {children}
        </div>
    );
    const buttonClasses = cn(
        "px-8 py-4 rounded-4xl text-sm font-medium transition-colors",
        className,
        variant === "destructive" &&
            "bg-red-600/80 hover:bg-red-700/70 text-white"
    );

    if (href) {
        return (
            <Link href={href} passHref>
                <Button variant={variant} className={buttonClasses} asChild>
                    {content}
                </Button>
            </Link>
        );
    }
    return (
        <Button variant={variant} onClick={onClick} className={buttonClasses}>
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-white flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
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
        <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-4xl border border-gray-700/50">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-white flex items-center gap-2">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    </section>
);

const EventCard = ({ event }: { event: Event }) => (
    <motion.div
        whileHover={{ y: -3 }}
        className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/60 h-full flex flex-col"
    >
        <h3 className="text-md font-semibold text-blue-300 mb-1 truncate group-hover:text-blue-200">
            {event.title}
        </h3>
        <div className="flex items-center text-xs text-gray-400 mb-2">
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            {new Date(event.start_time).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
            })}
            <Clock className="w-3.5 h-3.5 ml-2 mr-1.5 flex-shrink-0" />
            {new Date(event.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
        </div>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2 flex-grow">
            {event.description || "No description available."}
        </p>
        {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
                {event.tags.slice(0, 3).map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5"
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        )}
        <Button
            asChild
            size="sm"
            className="w-full text-white rounded-xl mt-auto bg-blue-600 hover:bg-blue-500 text-xs py-5"
        >
            <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
    </motion.div>
);

const SmallEventListItem = ({ event }: { event: Event }) => (
    <Link
        href={`/events/${event.id}`}
        className="block p-3 rounded-md hover:bg-gray-700/50 border border-transparent hover:border-gray-600/70 transition-all group"
    >
        <h4 className="font-medium text-sm text-gray-100 group-hover:text-blue-300 truncate">
            {event.title}
        </h4>
        <p className="text-xs text-gray-400 flex items-center">
            <Clock className="w-3 h-3 mr-1.5" />
            {new Date(event.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
            {event.location && (
                <>
                    <MapPin className="w-3 h-3 ml-2 mr-1" />{" "}
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
        <div className="p-4 rounded-lg border border-gray-700/60 bg-black/25 hover:border-gray-600 transition-all">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <div>
                    <h4 className="font-semibold text-md text-gray-100">
                        {event.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                        Attended:{" "}
                        {new Date(event.start_time).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            aria-label={`Rate ${star} stars`}
                            onClick={() => handleSetRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <ThumbsUp
                                className={cn(
                                    "w-5 h-5 transition-all duration-150 ease-in-out",
                                    (hoverRating || currentRating) >= star
                                        ? "text-yellow-400 fill-yellow-400/20 scale-110"
                                        : "text-gray-500 hover:text-gray-400"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
            {currentRating > 0 && (
                <p className="text-xs text-yellow-500">
                    Your rating: {currentRating} star
                    {currentRating > 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
};

export default DashboardPage;
