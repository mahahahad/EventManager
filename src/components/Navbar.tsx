"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data.user) {
                setUser(null);
                return;
            }
            setUser(data.user);

            // ✅ Check if user is an admin
            const { data: adminCheck } = await supabase
                .from("users")
                .select("is_admin")
                .eq("email", data.user.email)
                .single();

            setIsAdmin(adminCheck?.is_admin || false);
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

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
            setIsAdmin(true);
            alert("You are now an admin!");
        }
    };

    return (
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[85%] backdrop-blur-lg bg-black/30 shadow-md rounded-[48px] px-4 py-2 flex justify-start items-center text-white z-1">
            <div className="flex-grow-1">
                <Link
                    href="/"
                    className="text-l font-semibold hover:bg-black/40 px-6 py-2 rounded-[12px] rounded-[24px] transition"
                >
                    Home
                </Link>
                <Link
                    href="/dashboard"
                    className="text-l font-semibold hover:bg-black/40 px-6 py-2 rounded-[12px] rounded-[24px] transition"
                >
                    Dashboard
                </Link>
                <Link
                    href="/events"
                    className="text-l font-semibold hover:bg-black/40 px-6 py-2 rounded-[12px] rounded-[24px] transition"
                >
                    Events
                </Link>
            </div>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="font-bold cursor-pointer hover:bg-black/40 p-2 rounded-[12px] transition">
                        {user.user_metadata?.display_name || user.email}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-black/30 backdrop-blur-md shadow-md rounded-[16px] p-3 space-y-2 z-50"
                        forceMount
                    >
                        {isAdmin ? (
                            <DropdownMenuItem
                                onClick={() => router.push("/admin")}
                                className="hover:bg-black/40 transition rounded-[12px] p-2"
                            >
                                Admin Dashboard
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={handleMakeAdmin}
                                className="hover:bg-black/40 transition rounded-[12px] p-2"
                            >
                                Become Admin
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="hover:bg-black/40 transition rounded-[12px] p-2"
                        >
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex space-x-4">
                    <Link
                        href="/login"
                        className="hover:bg-black/40 p-2 rounded-[12px] transition"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/signup"
                        className="hover:bg-black/40 p-2 rounded-[12px] transition"
                    >
                        Sign Up
                    </Link>
                </div>
            )}
        </nav>
    );
}
