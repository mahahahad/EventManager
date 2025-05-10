"use client"; // Add this directive for client-side rendering

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Supabase client
import { Button } from "./ui/button"; // Button component
import Link from "next/link"; // Link component
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // ShadCN Dropdown components

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);

    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser(); // Get user from Supabase
            if (error || !data.user) {
                setUser(null); // If no user or error, clear user state
            } else {
                setUser(data.user); // If user is logged in, set user state
            }
        };

        fetchUser();
    }, []);

    // Handle user logout
    const handleLogout = async () => {
        await supabase.auth.signOut(); // Log out the user using Supabase
        setUser(null); // Clear user state
    };

    // Handle making the user an admin
    const handleMakeAdmin = async () => {
        if (!user) return;

        const { error } = await supabase
            .from("users")
            .update({ is_admin: true })
            .eq("email", user.email);

        if (error) {
            console.error("Failed to make user admin:", error.message);
            alert("Error promoting to admin.");
        } else {
            alert("You are now an admin!");
            // Optionally refetch user data here if needed
        }
    };

    return (
        <nav className="flex justify-between p-4 shadow-md">
            <Link href="/">Home</Link>
            {user ? (
                <div className="flex space-x-4 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <span className="font-bold cursor-pointer">
                                {user.user_metadata?.display_name || user.email}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleMakeAdmin}>
                                Become Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="flex space-x-4">
                    <Link href="/login">Log In</Link>
                    <Link href="/signup">Sign Up</Link>
                </div>
            )}
        </nav>
    );
}
