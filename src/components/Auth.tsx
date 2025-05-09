"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButtons() {
    const [email, setEmail] = useState("");

    const signIn = async () => {
        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
            console.error("Error signing in:", error);
            alert("Oops! Something went wrong 😢 Try again!");
        } else {
            alert("✨ Check your email for a login link! ✨");
        }
        // Wait until the user logs in, then fetch their details
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            // Insert user into the database
            await supabase
                .from("users")
                .upsert([
                    { id: user?.id, email: user?.email, is_admin: false },
                ]);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        alert("You have logged out successfully! 💕");
    };

    return (
        <div>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={signIn}>Login via Email</button>
            <button onClick={signOut}>Logout</button>
        </div>
    );
}
