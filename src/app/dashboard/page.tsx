"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Event as EventType } from "@/types/event";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar"; // <-- Add Navbar
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const DashboardPage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

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

    // Dates with events
    const eventDates = upcomingEvents.map((event) =>
        new Date(event.start_time).toDateString()
    );

    // Filter events for selected date
    const eventsOnSelectedDate = selectedDate
        ? upcomingEvents.filter(
              (event) =>
                  new Date(event.start_time).toDateString() ===
                  selectedDate.toDateString()
          )
        : [];

    return (
        <>
            <Navbar />
            <div className="pt-28 px-6 space-y-6">
                <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="backdrop-blur-xl bg-black/40 shadow-lg rounded-xl p-4 text-white border border-gray-700/50">
                        <h3 className="text-lg font-semibold mb-2">
                            Upcoming Events Calendar
                        </h3>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border bg-transparent text-white"
                            modifiers={{
                                hasEvent: (date) =>
                                    eventDates.includes(date.toDateString()),
                            }}
                            modifiersClassNames={{
                                hasEvent: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:bg-blue-500 after:h-1.5 after:w-1.5 after:rounded-full",
                            }}
                        />
                    </div>

                    <div className="backdrop-blur-xl bg-black/40 shadow-lg rounded-xl p-4 text-white border border-gray-700/50">
                        <h3 className="text-lg font-semibold mb-2">
                            Events on{" "}
                            {selectedDate
                                ? format(selectedDate, "PPP")
                                : "No date selected"}
                        </h3>
                        {eventsOnSelectedDate.length > 0 ? (
                            <ul>
                                {eventsOnSelectedDate.map((event) => (
                                    <li key={event.id} className="py-2">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="hover:underline"
                                        >
                                            {event.title} –{" "}
                                            {new Date(
                                                event.start_time
                                            ).toLocaleTimeString(undefined, {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No events scheduled for this date.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
