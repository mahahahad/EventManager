"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const [activeIndicatorProps, setActiveIndicatorProps] = useState<{
        width: number;
        left: number;
    } | null>(null);

    // --- Helper Function to Fetch User Data ---
    const fetchUserData = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("users") // Replace "users" with your actual table name
                .select("is_admin")
                .eq("id", userId)
                .single(); // Use .single() as we expect only one result

            if (error) {
                console.error("Error fetching user data:", error);
                return false; // Default to false in case of error
            }
            if (data) {
                return data.is_admin || false; // Ensure we return a boolean
            }
            return false;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return false;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError) {
                console.error("Error fetching auth user:", authError);
                setUser(null);
                setIsAdmin(false);
                return;
            }

            if (authData?.user) {
                setUser(authData.user);
                const isUserAdmin = await fetchUserData(authData.user.id); // Await the helper function
                setIsAdmin(isUserAdmin);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        };
        fetchUser();
    }, []);

    useLayoutEffect(() => {
        const activeLink = navLinksRef.current[pathname];
        if (activeLink) {
            const rect = activeLink.getBoundingClientRect();
            setActiveIndicatorProps({
                width: rect.width,
                left: activeLink.offsetLeft,
            });
        }
    }, [pathname, user]); // added user as a dependency

    const handleLinkClick = (path: string, ref: HTMLAnchorElement | null) => {
        setMenuOpen(false);
        router.push(path);
        if (ref) {
            setActiveIndicatorProps({
                width: ref.offsetWidth,
                left: ref.offsetLeft,
            });
        }
    };

    const navLinks = ["/", "/dashboard", "/events"];

    return (
        <motion.nav
            initial={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[85%] shadow-lg rounded-[48px] px-4 sm:px-6 py-3 flex justify-between items-center text-white z-50 backdrop-blur-lg border border-gray-700/50" // Added border here
        >
            <div className="flex-shrink-0">
                <Link
                    href="/"
                    className="text-xl font-bold hover:opacity-80 transition z-10 relative"
                    onClick={() =>
                        handleLinkClick("/", navLinksRef.current["/"])
                    }
                >
                    42EventManager
                </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex flex-grow justify-center items-center gap-6 relative">
                {activeIndicatorProps && (
                    <motion.div
                        className="absolute bg-white rounded-[12px] h-full"
                        layout
                        initial={false}
                        animate={{
                            width: activeIndicatorProps.width,
                            left: activeIndicatorProps.left,
                        }}
                        transition={{
                            ease: "circOut",
                            stiffness: 300,
                            damping: 20,
                        }}
                    />
                )}
                {navLinks.map((path) => (
                    <Link
                        key={path}
                        href={path}
                        data-active={path}
                        className="relative z-10 p-2 rounded-[12px] font-semibold text-sm lg:text-base hover:bg-black/40 transition text-white mix-blend-difference"
                        ref={(el) => {
                            navLinksRef.current[path] = el;
                        }}
                        onClick={() =>
                            handleLinkClick(path, navLinksRef.current[path])
                        }
                    >
                        {path === "/"
                            ? "Home"
                            : path.slice(1).charAt(0).toUpperCase() +
                              path.slice(2)}
                    </Link>
                ))}
            </div>

            {/* Desktop Dropdown */}
            <div className="hidden md:flex items-center gap-2">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="font-semibold cursor-pointer hover:bg-black/40 p-2 rounded-[12px] transition text-sm lg:text-base z-10 relative">
                            {user.user_metadata?.display_name || user.email}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-black/50 backdrop-blur-md shadow-xl rounded-[16px] p-2 space-y-1 z-[60] border-none text-white mt-2 w-48"
                            forceMount
                        >
                            {isAdmin && (
                                <DropdownMenuItem
                                    onClick={() => router.push("/admin")}
                                    className="hover:bg-black/40 transition rounded-[12px] p-2 cursor-pointer text-sm z-10 relative"
                                >
                                    Admin Dashboard
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setUser(null);
                                    setIsAdmin(false);
                                    router.push("/");
                                }}
                                className="hover:bg-black/40 transition rounded-[12px] p-2 cursor-pointer text-sm z-10 relative"
                            >
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex space-x-2">
                        <Link
                            href="/login"
                            className="hover:bg-black/40 p-2 rounded-[12px] transition text-sm lg:text-base font-semibold z-10 relative"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-blue-600 hover:bg-blue-700 p-2 px-4 rounded-[12px] transition text-sm lg:text-base font-semibold z-10 relative"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>

            {/* Hamburger */}
            <div className="md:hidden z-50 relative">
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="z-50"
                >
                    {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-8 text-white text-xl border border-gray-700/50"
                        style={{
                            height: "100vh",
                            zIndex: 40,
                        }}
                    >
                        {navLinks.map((path) => (
                            <button
                                key={path}
                                onClick={() => {
                                    handleLinkClick(
                                        path,
                                        navLinksRef.current[path]
                                    );
                                }}
                                className="font-semibold"
                            >
                                {path === "/"
                                    ? "Home"
                                    : path.slice(1).charAt(0).toUpperCase() +
                                      path.slice(2)}
                            </button>
                        ))}
                        {user && isAdmin && (
                            <button
                                onClick={() => {
                                    handleLinkClick("/admin", null);
                                }}
                                className="font-semibold"
                            >
                                Admin Dashboard
                            </button>
                        )}
                        {user ? (
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setUser(null);
                                    setIsAdmin(false);
                                    router.push("/");
                                    setMenuOpen(false);
                                }}
                                className="font-semibold"
                            >
                                Log Out
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() =>
                                        handleLinkClick(
                                            "/login",
                                            navLinksRef.current["/login"]
                                        )
                                    }
                                    className="font-semibold"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() =>
                                        handleLinkClick(
                                            "/signup",
                                            navLinksRef.current["/signup"]
                                        )
                                    }
                                    className="font-semibold"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

