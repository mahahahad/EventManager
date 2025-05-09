"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function WelcomePage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            await supabase.auth.getSession(); // ✅ Ensures session is loaded
            const {
                data: { user },
            } = await supabase.auth.getUser();

            console.log("User metadata at verification:", user?.user_metadata); // ✅ Check if username exists

            if (user) {
                const username = user.user_metadata?.username || "Unknown"; // ✅ Set default if missing

                const { error } = await supabase.from("users").upsert([
                    {
                        id: user.id,
                        email: user.email,
                        username,
                        is_admin: false,
                    },
                ]);

                if (error) {
                    console.error("Error inserting user:", error);
                    alert(
                        "Oops! Something went wrong while adding your account to the database. 😢"
                    );
                }
            }
        };

        fetchUser();
    }, []);

    return (
        <div>
            <h1>🎉 Welcome, {user?.user_metadata?.username}!</h1>
            <p>Your account is now verified!</p>
        </div>
    );
}
