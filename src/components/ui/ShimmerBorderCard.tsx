// components/ui/ShimmerBorderCard.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    motion,
    useSpring,
    useTransform,
    MotionValue,
    useMotionValue,
    useInView,
} from "framer-motion"; // Correctly import useMotionValue
import { useGlobalMousePosition } from "@/contexts/MousePositionContext";

interface ShimmerBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
    borderWidth?: string;
    defaultBorderWidth?: string;
    defaultBorderColor?: string;
    gradientColors?: [string, string, string];
    shimmerSize?: string;
    borderRadius?: string;
    opacityTransitionDuration?: number; // Although spring controls this now
    springStiffness?: number;
    springDamping?: number;
    contentClassName?: string;
    maxProximityOpacity?: number;
    hoverOpacity?: number;
    proximityThreshold?: number;
    backgroundOpacity?: number;
}

const ShimmerBorderCard: React.FC<ShimmerBorderCardProps> = ({
    children,
    className,
    borderWidth = "3px",
    defaultBorderWidth = "1px",
    defaultBorderColor = "rgba(100, 100, 120, 0.2)",
    gradientColors = ["#C084FC", "#A855F7", "transparent"],
    shimmerSize = "400px",
    borderRadius = "1.5rem",
    opacityTransitionDuration = 0.25, // Less relevant now spring dictates speed
    springStiffness = 250, // For mouse follow
    springDamping = 25, // For mouse follow
    contentClassName,
    maxProximityOpacity = 0.5,
    hoverOpacity = 1,
    proximityThreshold = 280,
    backgroundOpacity = 0.1,
    ...props
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    // isInView will trigger re-evaluation of effects that depend on it
    const isInView = useInView(cardRef, { once: false, amount: 0.05 }); // Trigger when 5% visible

    const { x: globalMouseX, y: globalMouseY } = useGlobalMousePosition();

    const relativeMouseX = useSpring(0, {
        stiffness: springStiffness,
        damping: springDamping,
        restDelta: 0.001,
    });
    const relativeMouseY = useSpring(0, {
        stiffness: springStiffness,
        damping: springDamping,
        restDelta: 0.001,
    });

    const [isHovering, setIsHovering] = useState(false);
    const [cardRect, setCardRect] = useState<DOMRect | null>(null);
    const [cardCenter, setCardCenter] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Effect to get card's own dimensions and center WHEN IT'S IN VIEW or on resize
    useEffect(() => {
        const cardElement = cardRef.current;
        if (cardElement && isInView) {
            // Only update if in view
            const updateRectAndCenter = () => {
                const rect = cardElement.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    // Ensure valid dimensions
                    // Only set if changed to avoid potential loops if rect itself causes re-renders
                    if (
                        cardRect?.left !== rect.left ||
                        cardRect?.top !== rect.top ||
                        cardRect?.width !== rect.width ||
                        cardRect?.height !== rect.height
                    ) {
                        setCardRect(rect);
                    }
                    const newCardCenter = {
                        x: rect.width / 2,
                        y: rect.height / 2,
                    };
                    if (
                        cardCenter?.x !== newCardCenter.x ||
                        cardCenter?.y !== newCardCenter.y
                    ) {
                        setCardCenter(newCardCenter);
                    }

                    // Initialize/reset springs to center of this card when it becomes visible AND not hovered
                    // if (!isHovering && cardCenter) {
                    //     relativeMouseX.set(cardCenter.x); // Let spring animate to center
                    //     relativeMouseY.set(cardCenter.y);
                    // }
                }
            };
            updateRectAndCenter(); // Call immediately when in view

            const resizeObserver = new ResizeObserver(updateRectAndCenter);
            resizeObserver.observe(cardElement);

            // Optional: Re-calculate on scroll if card position might change relative to viewport
            // window.addEventListener('scroll', updateRectAndCenter, { passive: true });

            return () => {
                resizeObserver.disconnect();
                // window.removeEventListener('scroll', updateRectAndCenter);
            };
        }
        // Dependencies: isInView is primary. isHovering, springs are for the reset logic within.
        // cardRect and cardCenter are set here, so they shouldn't be dependencies causing loops.
    }, [isInView, isHovering, relativeMouseX, relativeMouseY]);

    // Effect to update relative mouse position based on global mouse and THIS card's rect
    useEffect(() => {
        if (!cardRect) return;
        const updateRelative = (gx: number, gy: number) => {
            relativeMouseX.set(gx - cardRect.left);
            relativeMouseY.set(gy - cardRect.top);
        };

        const unsubX = globalMouseX.on("change", (gx) => {
            if (cardRect) updateRelative(gx, globalMouseY.get());
        });
        const unsubY = globalMouseY.on("change", (gy) => {
            if (cardRect) updateRelative(globalMouseX.get(), gy);
        });

        // Initial set when cardRect becomes available or global mouse moves
        if (cardRect) {
            updateRelative(globalMouseX.get(), globalMouseY.get());
        }

        return () => {
            unsubX();
            unsubY();
        };
    }, [globalMouseX, globalMouseY, cardRect, relativeMouseX, relativeMouseY]);

    // Effect to update CSS variables from the RELATIVE spring values
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const unsubX = relativeMouseX.on("change", (val) =>
            card.style.setProperty("--mouse-x", `${val}px`)
        );
        const unsubY = relativeMouseY.on("change", (val) =>
            card.style.setProperty("--mouse-y", `${val}px`)
        );

        // Set initial CSS variables based on current spring values
        card.style.setProperty("--mouse-x", `${relativeMouseX.get()}px`);
        card.style.setProperty("--mouse-y", `${relativeMouseY.get()}px`);

        return () => {
            unsubX();
            unsubY();
        };
    }, [relativeMouseX, relativeMouseY]);

    // Calculate distance from card center to relative mouse position
    const distance = useTransform<[number, number], number>(
        [relativeMouseX, relativeMouseY],
        (latestValues) => {
            const [mx, my] = latestValues; // latestValues is [number, number]
            if (
                !cardCenter ||
                typeof mx !== "number" ||
                typeof my !== "number"
            ) {
                return proximityThreshold + 100; // Return a large distance if no center or invalid coords
            }
            return Math.sqrt(
                Math.pow(mx - cardCenter.x, 2) + Math.pow(my - cardCenter.y, 2)
            );
        }
    );

    // This MotionValue will store the "target" opacity (0 to 1)
    const targetOpacityMV = useMotionValue(0); // CORRECTED: useMotionValue hook

    // Update targetOpacityMV whenever isHovering or distance changes
    useEffect(() => {
        const calculateTargetOpacity = (currentDistance: number) => {
            if (isHovering) {
                return hoverOpacity;
            }
            const proximityFactor = Math.max(
                0,
                1 - currentDistance / proximityThreshold
            );
            return proximityFactor * maxProximityOpacity;
        };

        // Function to update the target opacity motion value
        const updateTarget = () => {
            // distance.get() will give the current calculated distance
            targetOpacityMV.set(calculateTargetOpacity(distance.get()));
        };

        // Update when isHovering changes
        updateTarget();

        // Subscribe to distance changes
        const unsubscribeDistance = distance.on("change", updateTarget);

        return () => {
            unsubscribeDistance();
        };
        // Key dependencies for re-calculating target opacity
    }, [
        isHovering,
        distance,
        proximityThreshold,
        maxProximityOpacity,
        hoverOpacity,
        targetOpacityMV,
    ]);
    // Note: cardCenter is implicitly part of `distance`'s calculation path

    // animatedOpacity is a spring that follows targetOpacityMV
    const animatedOpacity = useSpring(targetOpacityMV, {
        stiffness: 300, // Slightly softer spring for opacity
        damping: 25,
        restDelta: 0.001,
    });

    const computedGradient = `radial-gradient(circle ${shimmerSize} at var(--mouse-x) var(--mouse-y), ${gradientColors[0]} 0%, ${gradientColors[1]} 15%, ${gradientColors[2]} 50%)`;

    return (
        <div
            ref={cardRef}
            className={cn("relative isolate", className)}
            style={{
                borderRadius: borderRadius,
                padding: borderWidth,
                boxShadow: `0 0 0 ${defaultBorderWidth} ${defaultBorderColor} inset`,
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            {...props}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                    // @ts-ignore
                    backgroundImage: computedGradient,
                    borderRadius: "inherit",
                    opacity: animatedOpacity,
                }}
            />

            <div
                className={cn(
                    "relative h-full w-full backdrop-blur-md",
                    contentClassName
                )}
                style={{
                    backgroundColor: `rgba(10, 5, 15, ${backgroundOpacity})`,
                    borderRadius: `max(0px, calc(${borderRadius} - ${borderWidth}))`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ShimmerBorderCard;
