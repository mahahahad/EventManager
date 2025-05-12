"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ChevronDown,
    Calendar,
    PlusCircle,
    Upload,
    List,
} from "lucide-react";

const AdminNavbar = () => {
    const [user, setUser] = useState<any | null>(null);
    const [menuOpen, setMenuOpen] = useState(false); // This state will control the externally placed mobile menu
    const router = useRouter();
    const pathname = usePathname();
    const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const [activeIndicatorProps, setActiveIndicatorProps] = useState<{
        width: number;
        left: number;
    } | null>(null);
    const [isEventsDropdownOpen, setIsEventsDropdownOpen] = useState(false);
    const [isMobileEventsMenuOpen, setIsMobileEventsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } =
                await supabase.auth.getUser();
            if (authError) {
                console.error("Error fetching auth user:", authError);
                setUser(null);
                return;
            }
            if (authData?.user) {
                setUser(authData.user);
            } else {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    useLayoutEffect(() => {
        setActiveIndicatorProps(null);
        const activeLink = navLinksRef.current[pathname];
        if (activeLink) {
            setActiveIndicatorProps({
                width: activeLink.offsetWidth,
                left: activeLink.offsetLeft,
            });
        }
    }, [pathname]);

    // Close mobile menu and sub-menu when a main link is clicked
    const handleLinkClick = (path: string) => {
        setMenuOpen(false);
        setIsMobileEventsMenuOpen(false);
        router.push(path);
        const ref = navLinksRef.current[path];
        if (ref) {
            setActiveIndicatorProps({
                width: ref.offsetWidth,
                left: ref.offsetLeft,
            });
        }
    };

    // Close mobile menu and sub-menu when a sub-menu item is clicked
    const handleSubMenuClick = (path: string) => {
        setMenuOpen(false);
        setIsMobileEventsMenuOpen(false);
        router.push(path);
    };

    const adminNavLinks = [
        {
            path: "/admin/dashboard",
            label: "Admin Dashboard",
            icon: LayoutDashboard,
        },
    ];

    return (
        <>
            {/* The actual navbar bar at the bottom */}
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 shadow-lg rounded-full px-2 flex justify-between items-center text-white z-50 backdrop-blur-lg border border-gray-700/50 bg-black/30"
            >
                {/* --- Desktop Navigation --- */}
                <div className="hidden md:flex flex-grow justify-center items-center gap-1 relative h-12">
                    {activeIndicatorProps && (
                        <motion.div
                            className="absolute bg-white/90 rounded-full h-10 top-1/2 -translate-y-1/2"
                            layoutId="activeIndicator"
                            initial={false}
                            animate={{
                                width: activeIndicatorProps.width + 20,
                                left: activeIndicatorProps.left - 10,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                        />
                    )}

                    {adminNavLinks.map((navLink) => (
                        <Link
                            key={navLink.path}
                            href={navLink.path}
                            ref={(el) => {
                                navLinksRef.current[navLink.path] = el;
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(navLink.path); // Use existing handler
                            }}
                            className={`relative z-10 px-4 py-2 rounded-full font-semibold text-sm lg:text-base transition-colors duration-300 flex items-center gap-2 ${
                                pathname === navLink.path ? "text-black" : "text-white hover:bg-white/10"
                            }`}
                        >
                            <navLink.icon className="w-4 h-4" />
                            {navLink.label}
                        </Link>
                    ))}

                    <div
                        onMouseEnter={() => setIsEventsDropdownOpen(true)}
                        onMouseLeave={() => setIsEventsDropdownOpen(false)}
                        className="relative"
                    >
                        <button
                            className={`relative z-10 px-4 py-2 rounded-full font-semibold text-sm lg:text-base transition-colors duration-300 flex items-center gap-2 cursor-pointer ${
                                isEventsDropdownOpen ? "bg-white/10 text-white" : "text-white hover:bg-white/10"
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Events
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isEventsDropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {isEventsDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute right-0 bottom-full mb-2 w-56 bg-black/50 backdrop-blur-lg shadow-xl rounded-xl p-2 space-y-1 z-[60] border border-gray-700/50 text-white"
                                >
                                    <button
                                        onClick={() => router.push("/admin/events/create")}
                                        className="w-full text-left hover:bg-white/10 transition rounded-lg py-2 px-3 cursor-pointer text-sm flex items-center gap-2"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Create Event
                                    </button>
                                    <button
                                        onClick={() => router.push("/admin/events/import")}
                                        className="w-full text-left hover:bg-white/10 transition rounded-lg py-2 px-3 cursor-pointer text-sm flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Import Event
                                    </button>
                                    <button
                                        onClick={() => router.push("/admin/events")}
                                        className="w-full text-left hover:bg-white/10 transition rounded-lg py-2 px-3 cursor-pointer text-sm flex items-center gap-2"
                                    >
                                        <List className="w-4 h-4" />
                                        View Events
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- Mobile Menu Button (remains inside the nav bar) --- */}
                <div className="md:hidden z-[51] relative flex items-center justify-center h-12 w-12"> {/* z-index slightly higher to ensure it's above nav's own content if any overlaps */}
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                        className="z-50 text-white p-2" // This z-index is relative to its parent
                    >
                        {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
                    </button>
                </div>
            </motion.nav>

            {/* --- Mobile Menu Overlay (MOVED OUTSIDE the main motion.nav) --- */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        // This z-index is global, z-40 is below the navbar's z-50
                        // The navbar (and its close button) will be on top of this overlay
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-4 text-white text-lg"
                        style={{
                            height: "100vh", // Or use h-screen if preferred
                        }}
                    >
                        {adminNavLinks.map((navLink) => (
                            <button
                                key={navLink.path}
                                onClick={() => handleLinkClick(navLink.path)}
                                className={`font-semibold flex items-center gap-3 py-3 px-6 rounded-lg transition-colors w-60 justify-center ${pathname === navLink.path ? "bg-white/20" : "hover:bg-white/10"}`}
                            >
                                <navLink.icon className="w-5 h-5" />
                                {navLink.label}
                            </button>
                        ))}

                        <div className="w-60">
                             <button
                                onClick={() => setIsMobileEventsMenuOpen(!isMobileEventsMenuOpen)}
                                className="font-semibold flex items-center gap-3 py-3 px-6 rounded-lg hover:bg-white/10 transition-colors w-full justify-center"
                            >
                                <Calendar className="w-5 h-5" />
                                Events
                                <ChevronDown className={`w-5 h-5 ml-auto transition-transform ${isMobileEventsMenuOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {isMobileEventsMenuOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden flex flex-col items-center space-y-1 mt-2 bg-black/20 backdrop-blur-md rounded-lg p-2 w-full"
                                    >
                                        <button
                                            onClick={() => handleSubMenuClick("/admin/events/create")}
                                            className="font-medium text-base flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-white/10 transition-colors w-full justify-center text-gray-200"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                            Create Event
                                        </button>
                                        <button
                                            onClick={() => handleSubMenuClick("/admin/events/import")}
                                             className="font-medium text-base flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-white/10 transition-colors w-full justify-center text-gray-200"
                                        >
                                            <Upload className="w-5 h-5" />
                                            Import Event
                                        </button>
                                        <button
                                            onClick={() => handleSubMenuClick("/admin/events")}
                                             className="font-medium text-base flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-white/10 transition-colors w-full justify-center text-gray-200"
                                        >
                                            <List className="w-5 h-5" />
                                            View Events
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminNavbar;
