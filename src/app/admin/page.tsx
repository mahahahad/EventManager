// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardTitle, CardDescription } from "@/components/ui/card";
import FullScreenBackground from "@/components/FullScreenBackground";
import {
    Users,
    Settings,
    BarChart3, // For Total Events
    CalendarCheck2, // For Upcoming Events
    UserPlus, // For Total Registrations
    Star, // For Average Rating
    Edit3, // For Manage Events (Event Management)
    UsersRound, // For Manage Users (User Administration)
    SlidersHorizontal, // For Site Settings (System Configuration)
    ChevronRight,
    Loader2, // For loading states
} from "lucide-react";

interface StatData {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColorClass?: string; // Optional background for the icon
    textColorClass?: string; // Optional text color for the icon
}

interface ManagementSection {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    buttonText: string;
}

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<StatData[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoadingStats(true);
            try {
                // 1. Total Events
                const { count: totalEventsCount, error: eventsError } =
                    await supabase
                        .from("events")
                        .select("*", { count: "exact", head: true });

                // 2. Total Registrations
                const { count: totalRegistrationsCount, error: regsError } =
                    await supabase
                        .from("event_registrations")
                        .select("*", { count: "exact", head: true });

                // 3. Upcoming Events
                const todayISO = new Date().toISOString();
                const { count: upcomingEventsCount, error: upcomingError } =
                    await supabase
                        .from("events")
                        .select("*", { count: "exact", head: true })
                        .gte("start_time", todayISO);

                // 4. Average Event Rating (more complex, might involve fetching all and calculating)
                // For simplicity, let's assume an RPC or a view could provide this.
                // Placeholder for now, or fetch all and calculate client-side if dataset is small.
                const { data: ratingsData, error: ratingsError } =
                    await supabase.from("user_event_ratings").select("rating");

                let avgRating = "N/A";
                if (!ratingsError && ratingsData && ratingsData.length > 0) {
                    const sum = ratingsData.reduce(
                        (acc, curr) => acc + curr.rating,
                        0
                    );
                    avgRating = (sum / ratingsData.length).toFixed(1);
                }

                if (
                    eventsError ||
                    regsError ||
                    upcomingError /* || ratingsError */
                ) {
                    console.error(
                        "Error fetching analytics:",
                        eventsError,
                        regsError,
                        upcomingError,
                        ratingsError
                    );
                }

                setStats([
                    {
                        title: "Total Events",
                        value: totalEventsCount ?? "N/A",
                        icon: <BarChart3 className="w-6 h-6" />,
                        textColorClass: "text-blue-400",
                        bgColorClass: "bg-blue-500/20",
                    },
                    {
                        title: "Total Registrations",
                        value: totalRegistrationsCount ?? "N/A",
                        icon: <UserPlus className="w-6 h-6" />,
                        textColorClass: "text-emerald-400",
                        bgColorClass: "bg-emerald-500/20",
                    },
                    {
                        title: "Upcoming Events",
                        value: upcomingEventsCount ?? "N/A",
                        icon: <CalendarCheck2 className="w-6 h-6" />,
                        textColorClass: "text-amber-400",
                        bgColorClass: "bg-amber-500/20",
                    },
                    {
                        title: "Average Rating",
                        value: avgRating,
                        icon: <Star className="w-6 h-6" />,
                        textColorClass: "text-pink-400",
                        bgColorClass: "bg-pink-500/20",
                    },
                ]);
            } catch (error) {
                console.error("Unexpected error fetching analytics:", error);
                // Set stats to N/A or show an error state
                setStats([
                    {
                        title: "Total Events",
                        value: "Error",
                        icon: <BarChart3 />,
                        textColorClass: "text-red-400",
                    },
                    {
                        title: "Total Registrations",
                        value: "Error",
                        icon: <UserPlus />,
                        textColorClass: "text-red-400",
                    },
                    {
                        title: "Upcoming Events",
                        value: "Error",
                        icon: <CalendarCheck2 />,
                        textColorClass: "text-red-400",
                    },
                    {
                        title: "Average Rating",
                        value: "Error",
                        icon: <Star />,
                        textColorClass: "text-red-400",
                    },
                ]);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchAnalytics();
    }, []);

    const managementSections: ManagementSection[] = [
        {
            title: "Event Management",
            description:
                "Oversee all event listings, create new ones, and manage existing entries.",
            href: "/admin/events",
            icon: <Edit3 className="w-6 h-6 text-blue-400" />,
            buttonText: "Manage Events",
        },
        {
            title: "User Administration",
            description:
                "View user profiles, manage roles, and handle account-related issues.",
            href: "/admin/users",
            icon: <UsersRound className="w-6 h-6 text-green-400" />,
            buttonText: "Manage Users",
        },
        {
            title: "System Configuration",
            description:
                "Adjust global site parameters, integrations, and core functionalities.",
            href: "/admin/settings",
            icon: <SlidersHorizontal className="w-6 h-6 text-purple-400" />,
            buttonText: "Configure Settings",
        },
    ];

    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG0dby1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // A more abstract/techy background
                // animatedGradient={true} // Example: use a subtle admin gradient
                blur={true}
                darkOverlay={true} // Keep dark overlay for focus
            />
            <AdminNavbar />

            <main className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
                <div className="text-center mb-12 sm:mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400">
                        Admin Control Panel
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                        Welcome, Administrator. Monitor site activity and manage
                        platform components.
                    </p>
                </div>

                {/* Analytics Stats Section */}
                <section className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-6 text-center sm:text-left">
                        Platform Overview
                    </h2>
                    {loadingStats ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-black/50 backdrop-blur-lg border border-gray-700/60 shadow-xl rounded-2xl p-6 animate-pulse"
                                >
                                    <div className="h-8 w-1/2 bg-gray-600/50 rounded mb-2"></div>
                                    <div className="h-10 w-1/3 bg-gray-600/50 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat) => (
                                <div
                                    key={stat.title}
                                    className="bg-black/50 backdrop-blur-lg border border-gray-700/60 shadow-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-blue-500/20 hover:border-gray-600"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-gray-400">
                                            {stat.title}
                                        </p>
                                        <div
                                            className={cn(
                                                "p-2 rounded-full",
                                                stat.bgColorClass,
                                                stat.textColorClass
                                            )}
                                        >
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Management Sections */}
                <section>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-8 text-center sm:text-left">
                        Management Tools
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {" "}
                        {/* Increased gap */}
                        {managementSections.map((section) => (
                            <Link
                                href={section.href}
                                key={section.title}
                                className="group block"
                            >
                                <div
                                    className={cn(
                                        "h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-gray-700/60 shadow-xl transition-all duration-300 ease-in-out",
                                        "bg-black/60 backdrop-blur-xl",
                                        "hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2" // Enhanced hover
                                    )}
                                >
                                    <div>
                                        <div className="mb-4 p-3 bg-gray-800/70 rounded-full w-fit">
                                            {" "}
                                            {/* Icon wrapper */}
                                            {section.icon}
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-100 mb-2 group-hover:text-blue-300 transition-colors">
                                            {section.title}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400 text-base leading-relaxed mb-6">
                                            {section.description}
                                        </CardDescription>
                                    </div>
                                    <div className="mt-auto">
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full !px-8 !py-3 text-base font-semibold group", // Increased padding further
                                                "border-gray-600 bg-gray-800/50 text-gray-200 hover:bg-blue-600/80 hover:border-blue-500 hover:text-white",
                                                "rounded-full shadow-md hover:shadow-lg hover:shadow-blue-500/30",
                                                "transition-all duration-300 ease-in-out",
                                                "flex items-center justify-center gap-2"
                                            )}
                                        >
                                            <span>{section.buttonText}</span>
                                            <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 opacity-70 group-hover:opacity-100" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
