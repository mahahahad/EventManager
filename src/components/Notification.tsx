"use client";

import React, { useState, useEffect } from "react";

interface NotificationProps {
    message: string;
    duration?: number;
    onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    duration = 3000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose();
                }
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50">
            {message}
            {onClose && (
                <button onClick={onClose} className="ml-2 text-sm">
                    Close
                </button>
            )}
        </div>
    );
};

export default Notification;
