"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Notification from "@/components/Notification";
import { Event } from "@/types/event"; // Assuming you have this type

const NotificationHandler: React.FC = () => {
    const [notificationMessage, setNotificationMessage] = useState<
        string | null
    >(null);

    useEffect(() => {
        const channel = supabase
            .channel("public:events")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "events" },
                (payload) => {
                    if (payload.new) {
                        const newEvent = payload.new as Event;
                        setNotificationMessage(
                            `New event created: ${newEvent.title}`
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleCloseNotification = useCallback(() => {
        setNotificationMessage(null);
    }, []);

    return (
        <>
            {notificationMessage && (
                <Notification
                    message={notificationMessage}
                    onClose={handleCloseNotification}
                />
            )}
        </>
    );
};

export default NotificationHandler;
