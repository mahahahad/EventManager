// src/components/AdminNavbar.tsx
"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    CalendarDays,
    // ArrowLeftToLine, // Removed
} from "lucide-react";

const ADMIN_NAV_LINKS_CONFIG = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/events", label: "Events", icon: CalendarDays },
];

const AdminNavbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const [activeIndicatorProps, setActiveIndicatorProps] = useState<{
        width: number;
        left: number;
    } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const adminNavLinks = ADMIN_NAV_LINKS_CONFIG;

    useLayoutEffect(() => {
        let activePathConfig: (typeof adminNavLinks)[0] | undefined;
        activePathConfig = adminNavLinks.find((link) => link.href === pathname);
        if (!activePathConfig) {
            activePathConfig = adminNavLinks
                .filter((link) => !link.exact)
                .sort((a, b) => b.href.length - a.href.length)
                .find((link) => pathname.startsWith(link.href));
        }
        if (!activePathConfig && pathname.startsWith("/admin") && adminNavLinks.some((l) => l.href === "/admin")) {
            activePathConfig = adminNavLinks.find((l) => l.href === "/admin");
        }
        const activeLinkElement = activePathConfig ? navLinksRef.current[activePathConfig.href] : null;
        if (activeLinkElement) {
            const newProps = { width: activeLinkElement.offsetWidth, left: activeLinkElement.offsetLeft };
            setActiveIndicatorProps((prevProps) => (prevProps?.width === newProps.width && prevProps?.left === newProps.left ? prevProps : newProps));
        } else {
            setActiveIndicatorProps(null);
        }
    }, [pathname, adminNavLinks]);

    const handleLinkClick = (path: string) => {
        setMenuOpen(false);
        router.push(path);
    };

    const isLinkActive = (linkHref: string, isExact?: boolean): boolean => {
        if (isExact) return pathname === linkHref;
        if (linkHref === "/admin") return pathname === "/admin" || (pathname.startsWith("/admin") && !adminNavLinks.some(l => l.href !== "/admin" && pathname.startsWith(l.href)));
        return pathname.startsWith(linkHref);
    };

    return (
        <motion.nav
            initial={{ y: 120, opacity: 0 }} // Start further down for a more noticeable entry
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.3 }}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[90%] md:w-auto md:min-w-[400px] lg:min-w-[480px] max-w-[calc(100%-2.5rem)] shadow-2xl rounded-[3rem] px-4 sm:px-5 py-3 flex justify-between items-center text-white z-40 bg-black/70 backdrop-blur-xl border border-gray-700/60"
            // Adjusted py-3 for overall navbar height
        >
            {/* Admin Panel Title */}
            <div className="flex-shrink-0">
                <Link
                    href="/admin"
                    className="text-md sm:text-lg font-bold hover:opacity-80 transition z-10 relative pl-1" // Added pl-1 for slight spacing
                    onClick={() => handleLinkClick("/admin")}
                >
                    Admin Panel
                </Link>
            </div>

            {/* Desktop Nav - Center Links */}
            {/* Conditional rendering to hide center links if only one item or adjust layout */}
            {adminNavLinks.length > 0 && (
                <div className={`hidden md:flex flex-grow ${adminNavLinks.length === 1 ? 'justify-start pl-8' : 'justify-center'} items-center gap-2 lg:gap-3 relative mx-4`}>
                    {activeIndicatorProps && (
                        <motion.div
                            className="absolute bg-slate-100 rounded-full h-[calc(100%-10px)] top-[5px]" // Indicator styling
                            layoutId="activeAdminBottomLinkIndicator"
                            initial={false}
                            animate={{ width: activeIndicatorProps.width, left: activeIndicatorProps.left }}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                    {adminNavLinks.map((link) => (
                        <Button
                            key={link.href}
                            asChild
                            variant="ghost"
                            // Applied !p-6 for very spacious buttons.
                            // Consider !px-6 !py-4 or !px-5 !py-3 if !p-6 is too much.
                            className={`relative z-10 !p-6 rounded-full font-medium text-sm hover:bg-gray-700/60 transition-all duration-200
                                        ${isLinkActive(link.href, link.exact) ? "text-gray-900" : "text-gray-200 hover:text-white"}`}
                        >
                            <Link href={link.href} onClick={() => handleLinkClick(link.href)}
                                ref={(el: HTMLAnchorElement | null) => { navLinksRef.current[link.href] = el; }}
                                className="flex items-center gap-2.5"> {/* Increased gap */}
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            )}


            {/* Mobile Menu Toggle - Now effectively the only item on the right for desktop if links are few */}
            <div className={`md:hidden ${adminNavLinks.length > 0 ? '' : 'ml-auto'} z-50 relative flex items-center`}> {/* ml-auto if no center links */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="p-2 rounded-full text-gray-200 hover:text-white hover:bg-gray-700/60 transition-colors h-10 w-10"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%", transition: { duration: 0.2, ease:"easeIn" } }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="fixed bottom-[calc(3.5rem+1.25rem+1rem)] left-0 right-0 w-[90%] max-w-sm mx-auto bg-black/80 backdrop-blur-xl z-30 flex flex-col items-center justify-center gap-y-4 text-white p-4 rounded-3xl border border-gray-700/50 shadow-2xl"
                        // Adjusted max-w, gap, and bottom positioning slightly
                    >
                        {adminNavLinks.map((link) => (
                            <Button
                                key={`mobile-${link.href}`}
                                asChild
                                variant="ghost"
                                className={`w-full text-lg !p-6 rounded-full transition-colors duration-200 ${isLinkActive(link.href, link.exact) ? "bg-blue-600/80 text-white" : "text-gray-200 hover:bg-gray-700/70"}`}
                            >
                                <Link href={link.href} onClick={() => handleLinkClick(link.href)} className="flex items-center justify-center gap-3">
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                        {/* "Back to Site" removed from mobile menu as well */}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default AdminNavbar;
