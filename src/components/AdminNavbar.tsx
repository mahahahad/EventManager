import React, { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { IoMenu, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const AdminNavbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const navLinksRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const [activeIndicatorProps, setActiveIndicatorProps] = useState<{
        width: number;
        left: number;
    } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

    const navLinks = [
        { href: "/admin/events", label: "Events" },
        // Removed: { href: '/admin/events/create', label: 'Create Event' },
        // Add other admin links as needed
    ];

    useLayoutEffect(() => {
        const activeLink = navLinksRef.current[pathname];
        if (activeLink) {
            const rect = activeLink.getBoundingClientRect();
            if (rect) {
                setActiveIndicatorProps({
                    width: rect.width,
                    left: activeLink.offsetLeft,
                });
            }
        }
    }, [pathname]);

    const handleLinkClick = (path: string, ref: HTMLAnchorElement | null) => {
        setMenuOpen(false); // Close menu on link click
        router.push(path);
        if (ref) {
            const rect = ref.getBoundingClientRect();
            if (rect) {
                setActiveIndicatorProps({
                    width: rect.width,
                    left: ref.offsetLeft,
                });
            }
        }
    };

    return (
        <motion.nav
            initial={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[85%] shadow-lg rounded-[48px] px-4 sm:px-6 py-3 flex justify-between items-center text-white z-50 backdrop-blur-lg border border-gray-700/50"
        >
            <div className="flex-shrink-0">
                <Link
                    href="/admin"
                    className="text-xl font-bold hover:opacity-80 transition z-10 relative"
                    onClick={() =>
                        handleLinkClick(
                            "/admin",
                            navLinksRef.current["/admin"] || null
                        )
                    }
                >
                    Admin Panel
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
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="relative z-10 p-2 rounded-[12px] font-semibold text-sm lg:text-base hover:bg-black/40 transition text-white mix-blend-difference"
                        ref={(el) => {
                            navLinksRef.current[link.href] = el;
                        }}
                        onClick={() =>
                            handleLinkClick(
                                link.href,
                                navLinksRef.current[link.href] || null
                            )
                        }
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href="/"
                    className="hidden md:block hover:opacity-80 transition z-10 relative"
                >
                    <Button
                        variant="outline"
                        className="text-white border-gray-700 hover:bg-black/40"
                    >
                        Back to Site
                    </Button>
                </Link>
                {/* Hamburger */}
                <div className="md:hidden z-50 relative">
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="z-50"
                    >
                        {menuOpen ? (
                            <IoClose size={28} />
                        ) : (
                            <IoMenu size={28} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
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
                        {navLinks.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => {
                                    handleLinkClick(
                                        link.href,
                                        navLinksRef.current[link.href] || null
                                    );
                                }}
                                className="font-semibold"
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                handleLinkClick("/", null);
                            }}
                            className="font-semibold"
                        >
                            Back to Site
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default AdminNavbar;
