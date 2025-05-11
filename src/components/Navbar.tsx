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
import {
    Home,
    LayoutDashboard,
    Calendar,
    LogIn,
    LogOut,
    UserPlus,
    Users,
    ChevronDown,
} from "lucide-react";

const Navbar = () => {
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

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
            const { data: authData, error: authError } =
                await supabase.auth.getUser();
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

    const navLinks = [
        { path: "/", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/events", label: "Events", icon: Calendar },
    ];

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
                        className="absolute bg-white rounded-full h-full"
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
                {navLinks.map((navLink) => (
                    <Link
                        key={navLink.path}
                        href={navLink.path}
                        data-active={navLink.path}
                        className="relative z-10 px-4 py-2 rounded-full font-semibold text-sm lg:text-base hover:bg-black/40 transition text-white mix-blend-difference flex items-center gap-3" // Increased px and added py
                        ref={(el) => {
                            navLinksRef.current[navLink.path] = el;
                        }}
                        onClick={() =>
                            handleLinkClick(
                                navLink.path,
                                navLinksRef.current[navLink.path]
                            )
                        }
                    >
                        <navLink.icon className="w-4 h-4" />
                        {navLink.label}
                    </Link>
                ))}
            </div>

            {/* Desktop Dropdown */}
            <div className="hidden md:flex items-center gap-2">
                {user ? (
                    <div
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                        className="relative"
                    >
                        <div className="font-semibold cursor-pointer hover:bg-black/40 p-2 rounded-full transition text-sm lg:text-base z-10  flex items-center gap-2">
                            {user.user_metadata?.display_name || user.email}
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </div>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 bg-black/50 backdrop-blur-md shadow-xl rounded-[16px] p-2 space-y-1 z-[60] border-none text-white  w-48"
                                >
                                    {isAdmin && (
                                        <div
                                            onClick={() => {
                                                router.push("/admin");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="hover:bg-black/40 transition rounded-full p-2 cursor-pointer text-sm  flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            Admin Dashboard
                                        </div>
                                    )}
                                    <div
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            setUser(null);
                                            setIsAdmin(false);
                                            router.push("/");
                                            setIsDropdownOpen(false);
                                        }}
                                        className="hover:bg-black/40 transition rounded-full p-2 cursor-pointer text-sm  flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log Out
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <Link
                            href="/login"
                            className="hover:bg-black/40 p-2 rounded-full transition text-sm lg:text-base font-semibold z-10 relative flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-blue-600 hover:bg-blue-700 p-2 px-4 rounded-full transition text-sm lg:text-base font-semibold z-10 relative flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
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
                        {navLinks.map((navLink) => (
                            <button
                                key={navLink.path}
                                onClick={() => {
                                    handleLinkClick(
                                        navLink.path,
                                        navLinksRef.current[navLink.path]
                                    );
                                }}
                                className="font-semibold"
                            >
                                <navLink.icon className="w-6 h-6" />
                                {navLink.label}
                            </button>
                        ))}
                        {user ? (
                            isAdmin ? (
                                <button
                                    onClick={() => {
                                        handleLinkClick("/admin", null);
                                    }}
                                    className="font-semibold flex items-center gap-2"
                                >
                                    <Users className="w-6 h-6" />
                                    Admin Dashboard
                                </button>
                            ) : null
                        ) : null}
                        {user ? (
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setUser(null);
                                    setIsAdmin(false);
                                    router.push("/");
                                    setMenuOpen(false);
                                }}
                                className="font-semibold flex items-center gap-2"
                            >
                                <LogOut className="w-6 h-6" />
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
                                    className="font-semibold flex items-center gap-2"
                                >
                                    <LogIn className="w-6 h-6" />
                                    Log In
                                </button>
                                <button
                                    onClick={() =>
                                        handleLinkClick(
                                            "/signup",
                                            navLinksRef.current["/signup"]
                                        )
                                    }
                                    className="font-semibold flex items-center gap-2"
                                >
                                    <UserPlus className="w-6 h-6" />
                                    Sign Up
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
