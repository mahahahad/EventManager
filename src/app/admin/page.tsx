// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardTitle, CardDescription } from "@/components/ui/card"; // CardDescription might be used in new cards
import FullScreenBackground from "@/components/FullScreenBackground";
import {
    Users, // Kept for consistency if re-added
    Settings, // Kept for consistency if re-added
    BarChart3,
    CalendarCheck2,
    UserPlus,
    PlusCircle,
    Star,
    Edit3, // For "Create Event" or general event tasks
    ListOrdered, // For "View All Events"
    UploadCloud, // For "Import Events"
    ChevronRight,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion"; // For card animations

interface StatData {
    /* ... same as before ... */
}

// New interface for the action cards
interface ActionCardData {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType; // Use React.ElementType for Lucide icons
    iconColorClass?: string;
    buttonText?: string; // Optional, can be derived or fixed
}

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<StatData[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        /* ... fetchAnalytics logic remains the same ... */
    }, []);

    const actionCards: ActionCardData[] = [
        {
            title: "View All Events",
            description:
                "Browse, search, and manage all existing event listings.",
            href: "/admin/events",
            icon: ListOrdered,
            iconColorClass: "text-sky-400",
            buttonText: "Go to Events",
        },
        {
            title: "Create New Event",
            description:
                "Add a new event to the platform with all necessary details.",
            href: "/admin/events/create",
            icon: PlusCircle, // Changed from Edit3 to be more specific
            iconColorClass: "text-emerald-400",
            buttonText: "Create Event",
        },
        {
            title: "Import Events",
            description: "Bulk import events from external sources or files.",
            href: "/admin/events/import",
            icon: UploadCloud,
            iconColorClass: "text-amber-400",
            buttonText: "Import Data",
        },
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1, // Stagger based on index
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        }),
    };

    return (
        <div className="relative min-h-screen text-white">
            {" "}
            {/* Added bg-black as base */}
            <FullScreenBackground
            />
            <main className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400">
                        Admin Control Panel
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                        Welcome, Administrator. Monitor site activity and manage
                        platform components.
                    </p>
                </motion.div>

                {/* Analytics Stats Section */}
                <section className="mb-12 sm:mb-16">
                    {/* ... (Analytics stats rendering remains the same) ... */}
                </section>

                {/* Management Action Cards Section */}
                <section>
                    <motion.h2
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: 0.3,
                            ease: "circOut",
                        }}
                        className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-8 text-center sm:text-left"
                    >
                        Event Tools
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {actionCards.map((card, index) => (
                            <motion.div
                                key={card.title}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible" // Or whileInView if preferred
                                viewport={{ once: true, amount: 0.2 }}
                            >
                                <Link
                                    href={card.href}
                                    className="group block h-full"
                                >
                                    <div
                                        className={cn(
                                            "h-full flex flex-col justify-between p-6 rounded-3xl border border-gray-700/50 shadow-xl transition-all duration-300 ease-in-out",
                                            "bg-black/60 backdrop-blur-xl",
                                            "hover:border-sky-500/60 hover:shadow-2xl hover:shadow-sky-500/20 transform hover:-translate-y-1.5"
                                        )}
                                    >
                                        <div>
                                            <div
                                                className={cn(
                                                    "mb-5 p-3 bg-gray-800/60 rounded-full w-fit transition-colors duration-300 group-hover:bg-sky-700/30",
                                                    card.iconColorClass?.replace(
                                                        "text-",
                                                        "group-hover:text-"
                                                    )
                                                )}
                                            >
                                                <card.icon
                                                    className={cn(
                                                        "w-7 h-7 transition-colors duration-300",
                                                        card.iconColorClass,
                                                        "group-hover:text-sky-300"
                                                    )}
                                                />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-sky-300 transition-colors duration-300">
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                                {card.description}
                                            </p>
                                        </div>
                                        <div className="mt-auto">
                                            <div // Mimic Button appearance for non-interactive part
                                                className={cn(
                                                    "w-full !px-6 !py-3 text-sm font-semibold",
                                                    "border border-gray-600 bg-gray-800/40 text-gray-300 group-hover:bg-sky-600/70 group-hover:border-sky-500 group-hover:text-white",
                                                    "rounded-full shadow-md group-hover:shadow-lg group-hover:shadow-sky-500/25",
                                                    "transition-all duration-300 ease-in-out",
                                                    "flex items-center justify-center gap-2"
                                                )}
                                            >
                                                <span>
                                                    {card.buttonText ||
                                                        "Proceed"}
                                                </span>
                                                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 opacity-70 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
