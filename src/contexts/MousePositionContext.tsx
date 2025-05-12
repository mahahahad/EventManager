// contexts/MousePositionContext.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useMotionValue, MotionValue } from "framer-motion";

interface MousePosition {
    x: MotionValue<number>;
    y: MotionValue<number>;
}

const MousePositionContext = createContext<MousePosition | undefined>(
    undefined
);

export const MousePositionProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            x.set(event.clientX);
            y.set(event.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [x, y]);

    return (
        <MousePositionContext.Provider value={{ x, y }}>
            {children}
        </MousePositionContext.Provider>
    );
};

export const useGlobalMousePosition = () => {
    const context = useContext(MousePositionContext);
    if (context === undefined) {
        throw new Error(
            "useGlobalMousePosition must be used within a MousePositionProvider"
        );
    }
    return context;
};
