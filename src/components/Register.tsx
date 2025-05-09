"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signUp = async () => {
        const {
            data: { user },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: "http://localhost:3000/welcome",
                data: { username }, // ✅ Stores username in metadata
            },
        });

        if (error) {
            console.error("Error signing up:", error);
            alert("Oops! Something went wrong 😢 Try again!");
        } else {
            alert("🎉 Check your email to confirm your account!");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signUp}>Sign Up</button>
        </div>
    );
}
