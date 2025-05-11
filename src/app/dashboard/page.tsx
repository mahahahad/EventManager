"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventType } from "@/types/event";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DayPickerProps } from "react-day-picker";

const DashboardPage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            const today = new Date().toISOString();
            const { data, error } = await supabase
                .from("events")
                .select("id, title, start_time")
                .gte("start_time", today)
                .order("start_time", { ascending: true });

            if (error) {
                console.error("Error fetching upcoming events:", error);
            } else {
                setUpcomingEvents((data || []) as EventType[]);
            }
        };

        fetchUpcomingEvents();
    }, []);

    const eventDatesMap = upcomingEvents.reduce((acc, event) => {
        const dateString = new Date(event.start_time).toDateString();
        acc[dateString] = true;
        return acc;
    }, {} as Record<string, boolean>);

    const eventsOnSelectedDate = selectedDate
        ? upcomingEvents.filter(
              (event) =>
                  new Date(event.start_time).toDateString() === selectedDate.toDateString()
          )
        : [];

    return (
        <div className="relative min-h-screen text-white pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
            {/* Background Visuals with Parallax Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 sm:opacity-40 transition-all duration-300"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    transform: "scale(1.1)",
                }}
            ></div>
            {/* Enhanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black"></div>

            <Navbar />
            <div className="relative z-10 px-6 py-8 max-w-4xl mx-auto space-y-6">
                <h2 className="text-4xl font-bold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300">
                    Your Dashboard
                </h2>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-black/40 backdrop-blur-lg shadow-xl rounded-xl border border-black/50 dark:bg-gray-800/70 dark:border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Total Events</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-center text-white">
                            <p className="text-4xl">{upcomingEvents.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-lg shadow-xl rounded-xl border border-black/50 dark:bg-gray-800/70 dark:border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-center text-white">
                            <p className="text-4xl">{eventsOnSelectedDate.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-black/40 backdrop-blur-lg shadow-xl rounded-xl border border-black/50 dark:bg-gray-800/70 dark:border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">New Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-center text-white">
                            <Badge className="bg-red-600 text-white">3 New Updates</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-xl border border-black/50 dark:bg-gray-800/70 dark:border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Upcoming Events Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="w-full flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    classNames={{
                                        day: "h-14 w-14 p-0 font-normal text-center text-base rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 ease-in-out hover:bg-neutral-700 text-white",
                                        day_selected:
                                            "bg-blue-500 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                        day_today: "font-semibold text-white",
                                        day_outside: "text-neutral-500 opacity-50",
                                        caption_label: "text-sm font-medium text-white",
                                        nav_button: cn(
                                            "bg-transparent text-white hover:bg-neutral-700",
                                            "focus:bg-neutral-700 focus:outline-none rounded-md p-1",
                                            "transition-colors duration-200 ease-in-out"
                                        ),
                                        nav_button_previous: "hover:bg-neutral-700 rounded-md p-1 text-white",
                                        nav_button_next: "hover:bg-neutral-700 rounded-md p-1 text-white",
                                    }}
                                    modifiers={{
                                        hasEvent: (date) => eventDatesMap[date.toDateString()],
                                    }}
                                    modifiersClassNames={{
                                        hasEvent:
                                            "relative before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-1 before:rounded-full before:bg-blue-500",
                                    }}
                                />
                            </div>
                            {selectedDate && (
                                <p className="mt-2 text-sm text-neutral-400">
                                    Selected date: {format(selectedDate, "PPP")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Events on Selected Date Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-black/30 backdrop-blur-lg shadow-xl rounded-xl border border-black/50 dark:bg-gray-800/70 dark:border-gray-600">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">
                                Events on {selectedDate ? format(selectedDate, "PPP") : "Select a Date"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-white">
                            {eventsOnSelectedDate.length > 0 ? (
                                <ul className="space-y-3">
                                    {eventsOnSelectedDate.map((event) => (
                                        <li key={event.id} className="flex items-center justify-between">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="hover:underline text-blue-400 transition duration-300 ease-in-out"
                                            >
                                                {event.title}
                                            </Link>
                                            <Badge className="bg-blue-600 border-0 shadow-md text-white">
                                                {new Date(event.start_time).toLocaleTimeString(undefined, {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-neutral-400">
                                    {selectedDate ? "No events scheduled for this date." : "Please select a date to view events."}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardPage;
