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
import { motion } from "framer-motion";

export default function Navbar() {
    const [user, setUser] = useState<any | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({}); // Allow null
    const [activeIndicatorProps, setActiveIndicatorProps] = useState<{
        width: number;
        height: number;
        left: number;
        top: number;
    } | null>(null);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [currentActivePath, setCurrentActivePath] = useState(pathname);

    useLayoutEffect(() => {
        setCurrentActivePath(pathname); // Update active path on initial load and route changes
        const activeLink = Object.values(navLinksRef.current).find(
            (ref) => ref && isActive(new URL(ref.href).pathname)
        );
        if (activeLink) {
            setActiveIndicatorProps({
                width: activeLink.offsetWidth,
                height: activeLink.offsetHeight,
                left: activeLink.offsetLeft,
                top: activeLink.offsetTop,
            });
        }
        setIsInitialRender(false);
    }, [pathname]);

    useEffect(() => {
        if (user && Object.keys(navLinksRef.current).length > 0) {
            const activeLink = Object.values(navLinksRef.current).find(
                (ref) => ref && isActive(new URL(ref.href).pathname)
            );
            if (activeLink) {
                setActiveIndicatorProps({
                    width: activeLink.offsetWidth,
                    height: activeLink.offsetHeight,
                    left: activeLink.offsetLeft,
                    top: activeLink.offsetTop,
                });
            }
        }
    }, [user, pathname, navLinksRef]);
    useEffect(() => {
        const fetchUserAndAdminStatus = async () => {
            const { data: authData, error: authError } =
                await supabase.auth.getUser();

            if (authError || !authData.user) {
                setUser(null);
                setIsAdmin(false);
                return;
            }
            setUser(authData.user);

            const { data: adminCheck, error: adminError } = await supabase
                .from("users")
                .select("is_admin")
                .eq("email", authData.user.email)
                .single();

            if (adminError) {
                console.error("Error fetching admin status:", adminError);
                setIsAdmin(false);
            } else {
                setIsAdmin(adminCheck?.is_admin || false);
            }
        };

        fetchUserAndAdminStatus();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user;
                setUser(currentUser ?? null);
                if (currentUser) {
                    fetchUserAndAdminStatus();
                } else {
                    setIsAdmin(false);
                }
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    const handleBecomeAdmin = async () => {
        if (!user) return;
        const { error } = await supabase
            .from("users")
            .update({ is_admin: true })
            .eq("email", user.email);

        if (error) {
            alert("Failed to become admin: " + error.message);
        } else {
            setIsAdmin(true);
            alert("You are now an admin! Refresh or navigate to see changes.");
        }
    };

    const isActive = (path: string) => pathname === path;

    const linkClasses = (path: string) =>
        `text-sm lg:text-base font-semibold relative z-10 hover:bg-black/40 p-2 rounded-[12px] transition ${
            currentActivePath === path ? "text-black" : "text-white"
        }`; // Initially text-white, becomes black when active

    const mobileLinkClasses = (path: string) =>
        `text-xl font-semibold relative z-10 hover:bg-black/40 p-3 rounded-[12px] transition ${
            isActive(path) ? "text-black" : ""
        }`;

    const handleLinkClick = (path: string, ref: HTMLAnchorElement | null) => {
        setMenuOpen(false);
        setCurrentActivePath(path); // Update the active path immediately
        if (ref) {
            setActiveIndicatorProps({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                left: ref.offsetLeft,
                top: ref.offsetTop,
            });
        }
        router.push(path);
    };

    useLayoutEffect(() => {
        // Set initial active indicator position on mount
        const activeLink = Object.values(navLinksRef.current).find(
            (ref) => ref && isActive(new URL(ref.href).pathname)
        );
        if (activeLink) {
            setActiveIndicatorProps({
                width: activeLink.offsetWidth,
                height: activeLink.offsetHeight,
                left: activeLink.offsetLeft,
                top: activeLink.offsetTop,
            });
        }
        setIsInitialRender(false);
    }, [pathname]);

    return (
        <>
            <motion.nav
                initial={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                animate={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                transition={{ duration: 0.3 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[85%] shadow-lg rounded-[48px] px-4 sm:px-6 py-3 flex justify-between items-center text-white z-50 backdrop-blur-lg"
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

                <div className="hidden md:flex flex-grow justify-center items-center gap-3 lg:gap-6 relative overflow-hidden rounded-[12px]">
                    {activeIndicatorProps && (
                        <motion.div
                            className="absolute bg-white rounded-[12px]"
                            layout
                            style={{ ...activeIndicatorProps, zIndex: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                        />
                    )}
                    <Link
                        href="/"
                        className={linkClasses("/")}
                        ref={(el) => {
                            navLinksRef.current["/"] = el;
                            return; // Explicitly return void
                        }}
                        onClick={() =>
                            handleLinkClick("/", navLinksRef.current["/"])
                        }
                    >
                        Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className={linkClasses("/dashboard")}
                        ref={(el) => {
                            navLinksRef.current["/dashboard"] = el;
                            return; // Explicitly return void
                        }}
                        onClick={() =>
                            handleLinkClick(
                                "/dashboard",
                                navLinksRef.current["/dashboard"]
                            )
                        }
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/events"
                        className={linkClasses("/events")}
                        ref={(el) => {
                            navLinksRef.current["/events"] = el;
                            return; // Explicitly return void
                        }}
                        onClick={() =>
                            handleLinkClick(
                                "/events",
                                navLinksRef.current["/events"]
                            )
                        }
                    >
                        Events
                    </Link>
                </div>

                <div className="flex items-center gap-2 z-10 relative">
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="font-semibold cursor-pointer hover:bg-black/40 p-2 rounded-[12px] transition text-sm lg:text-base z-10 relative">
                                    {user.user_metadata?.display_name ||
                                        user.email}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-black/50 backdrop-blur-md shadow-xl rounded-[16px] p-2 space-y-1 z-[60] border-none text-white mt-2 w-48"
                                    forceMount
                                >
                                    {isAdmin && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                router.push("/admin");
                                            }}
                                            className="hover:bg-black/40 transition rounded-[12px] p-2 cursor-pointer text-sm z-10 relative"
                                        >
                                            Admin Dashboard
                                        </DropdownMenuItem>
                                    )}
                                    {!isAdmin && (
                                        <DropdownMenuItem
                                            onClick={handleBecomeAdmin}
                                            className="hover:bg-black/40 transition rounded-[12px] p-2 cursor-pointer text-sm z-10 relative"
                                        >
                                            Become Admin (Dev)
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
                                    onClick={() =>
                                        handleLinkClick(
                                            "/login",
                                            navLinksRef.current["/login"]
                                        )
                                    }
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 p-2 px-4 rounded-[12px] transition text-sm lg:text-base font-semibold z-10 relative"
                                    onClick={() =>
                                        handleLinkClick(
                                            "/signup",
                                            navLinksRef.current["/signup"]
                                        )
                                    }
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        className="md:hidden text-2xl p-2 rounded-full hover:bg-black/40 transition z-10 relative"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <IoClose size={28} />
                        ) : (
                            <IoMenu size={28} />
                        )}
                    </button>
                </div>
            </motion.nav>

            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden fixed inset-0 top-[80px] bg-black/70 backdrop-blur-md z-40 flex flex-col items-center justify-center space-y-6 text-white"
                    onClick={() => setMenuOpen(false)}
                >
                    <Link
                        href="/"
                        className={mobileLinkClasses("/")}
                        onClick={() => handleLinkClick("/", null)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className={mobileLinkClasses("/dashboard")}
                        onClick={() => handleLinkClick("/dashboard", null)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/events"
                        className={mobileLinkClasses("/events")}
                        onClick={() => handleLinkClick("/events", null)}
                    >
                        Events
                    </Link>
                    <hr className="w-1/2 border-gray-600" />
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className={mobileLinkClasses("/admin")}
                                    onClick={() =>
                                        handleLinkClick("/admin", null)
                                    }
                                >
                                    Admin Dashboard
                                </Link>
                            )}
                            {!isAdmin && (
                                <button
                                    onClick={() => {
                                        handleBecomeAdmin();
                                        setMenuOpen(false);
                                    }}
                                    className="text-xl font-semibold hover:bg-black/40 p-3 rounded-[12px] transition w-full text-center"
                                >
                                    Become Admin (Dev)
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setUser(null);
                                    setIsAdmin(false);
                                    setMenuOpen(false);
                                    router.push("/");
                                }}
                                className="text-xl font-semibold hover:bg-black/40 p-3 rounded-[12px] transition w-full text-center"
                            >
                                Log Out
                            </button>
                            <div className="pt-4 text-center text-gray-400">
                                Logged in as:{" "}
                                {user.user_metadata?.display_name || user.email}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={mobileLinkClasses("/login")}
                                onClick={() => handleLinkClick("/login", null)}
                            >
                                Log In
                            </Link>
                            <Link
                                href="/signup"
                                className="text-xl bg-blue-600 hover:bg-blue-700 p-3 px-6 rounded-[12px] transition font-semibold"
                                onClick={() => handleLinkClick("/signup", null)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </motion.div>
            )}
        </>
    );
}
