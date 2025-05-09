"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    return (
        <nav>
            <h1>Event Management</h1>
            {user ? (
                <p>Logged in as {user?.user_metadata?.username} 💖</p>
            ) : (
                <p>Not logged in 😢</p>
            )}
        </nav>
    );
}
