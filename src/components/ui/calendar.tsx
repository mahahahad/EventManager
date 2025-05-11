"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Event } from "@/types/database";

interface CalendarProps {
    events?: Event[];
    onDateSelect?: (date: Date) => void;
    className?: string;
}

export function EventCalendar({
    events = [],
    onDateSelect,
    className,
}: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Get current month details
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get first day of the month and total days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Days of the week
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Month names for the header
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // Navigate to previous month
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    // Navigate to next month
    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    // Check if a date has events
    const hasEvents = (day: number) => {
        const dateToCheck = new Date(currentYear, currentMonth, day);
        return events.some((event) => {
            const eventDate = new Date(event.start_time);
            const eventDateObj = new Date(eventDate);
            return (
                eventDateObj.getDate() === dateToCheck.getDate() &&
                eventDateObj.getMonth() === dateToCheck.getMonth() &&
                eventDateObj.getFullYear() === dateToCheck.getFullYear()
            );
        });
    };

    // Handle date selection
    const handleDateClick = (day: number) => {
        const newSelectedDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newSelectedDate);
        if (onDateSelect) {
            onDateSelect(newSelectedDate);
        }
    };

    // Check if a date is today
    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    // Check if a date is selected
    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear()
        );
    };

    // Get events for a specific day
    const getEventsForDay = (day: number): Event[] => {
        const dateToCheck = new Date(currentYear, currentMonth, day);
        return events.filter((event) => {
            const eventDate = new Date(event.start_time);
            const eventDateObj = new Date(eventDate);
            return (
                eventDateObj.getDate() === dateToCheck.getDate() &&
                eventDateObj.getMonth() === dateToCheck.getMonth() &&
                eventDateObj.getFullYear() === dateToCheck.getFullYear()
            );
        });
    };

    // Generate calendar grid
    const generateCalendarGrid = () => {
        const calendarDays = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-10 p-1" />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const hasEventsForDay = hasEvents(day);
            const eventsForDay = getEventsForDay(day); // Get events for the current day

            calendarDays.push(
                <div
                    key={`day-${day}`}
                    className={cn(
                        "h-auto min-h-10 p-1 relative", // Changed h-10 to h-auto
                        "flex flex-col items-center justify-start" // Changed justify-center to justify-start
                    )}
                >
                    <button
                        onClick={() => handleDateClick(day)}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center relative mb-1", // Added mb-1
                            isToday(day) && "bg-blue-600 text-white",
                            isSelected(day) &&
                                !isToday(day) &&
                                "bg-blue-500/20 text-blue-500",
                            !isToday(day) &&
                                !isSelected(day) &&
                                "hover:bg-blue-500/10",
                            "transition-colors duration-200"
                        )}
                        aria-label={`${day} ${monthNames[currentMonth]} ${currentYear}`}
                        aria-selected={isSelected(day)}
                    >
                        {day}
                    </button>
                    {hasEventsForDay && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-1" />
                    )}
                </div>
            );
        }

        return calendarDays;
    };

    return (
        <div
            className={cn(
                "w-full rounded-lg bg-transparent ext-card-foreground shadow-sm",
                className
            )}
        >
            <div className="p-4">
                {/* Calendar header with month/year and navigation */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <div className="flex space-x-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPreviousMonth}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNextMonth}
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {generateCalendarGrid()}
                </div>
            </div>
        </div>
    );
}
