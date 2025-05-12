// components/Notification.tsx (or components/ui/Notification.tsx)
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"; // Icons
import { cn } from "@/lib/utils"; // Assuming you have this utility

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
    id?: string; // Optional ID for managing multiple notifications
    message: string | React.ReactNode;
    type?: NotificationType;
    duration?: number; // Duration in ms, 0 for persistent until closed
    onClose?: (id?: string) => void;
    showCloseButton?: boolean;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const notificationStyles: Record<NotificationType, string> = {
    success: "bg-emerald-600/80 border-emerald-500/70 text-emerald-100",
    error: "bg-red-700/80 border-red-600/70 text-red-100",
    info: "bg-sky-600/80 border-sky-500/70 text-sky-100",
    warning: "bg-amber-600/80 border-amber-500/70 text-amber-100",
};

const Notification: React.FC<NotificationProps> = ({
    id,
    message,
    type = "info", // Default to 'info'
    duration = 5000, // Default 5 seconds
    onClose,
    showCloseButton = true,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose, id]); // Added id to dependency array

    const handleClose = () => {
        setIsVisible(false);
        // AnimatePresence will handle the exit animation before onAnimationComplete fires
    };

    const IconComponent = notificationIcons[type];
    const typeStyles = notificationStyles[type];

    return (
        <AnimatePresence onExitComplete={() => onClose && onClose(id)}>
            {isVisible && (
                <motion.div
                    layout // Animate layout changes if multiple notifications stack
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className={cn(
                        "fixed bottom-6 right-6 w-full max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md",
                        "flex items-start gap-3 z-[100]", // High z-index for notifications
                        typeStyles // Apply type-specific background and text colors
                    )}
                    role="alert"
                    aria-live="assertive"
                >
                    {IconComponent && (
                        <IconComponent className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-grow text-sm font-medium break-words">
                        {message}
                    </div>
                    {showCloseButton && onClose && (
                        <button
                            onClick={handleClose}
                            className={cn(
                                "ml-auto -mr-1 -mt-1 p-1.5 rounded-full transition-colors flex-shrink-0",
                                "hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                            )}
                            aria-label="Close notification"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;
