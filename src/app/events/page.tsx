"use client";
import EventList from "@/components/EventList";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EventsPage() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // ✅ Fetch admin status from the custom users table
            const { data, error } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (!error) {
                setIsAdmin(data?.is_admin || false);
            }
        };
        checkAdmin();
    }, []);

    return <EventList isAdmin={isAdmin} />;
}
