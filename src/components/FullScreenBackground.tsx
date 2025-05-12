// components/FullScreenBackground.tsx
import React from "react";

interface Props {
    imageUrl?: string; // Make imageUrl optional, provide a default
    animatedGradient?: boolean;
    blur?: boolean;
    darkOverlay?: boolean;
}

const DEFAULT_IMAGE_URL =
    "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const FullScreenBackground: React.FC<Props> = ({
    imageUrl = DEFAULT_IMAGE_URL, // Use default if not provided
    animatedGradient = true,
    blur = true,
    darkOverlay = true,
}) => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 sm:opacity-30 ${
                        blur ? "blur-sm" : "" // Consider slightly more blur: "blur-md"
                    }`}
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                ></div>
                {darkOverlay && (
                    <div className="absolute inset-0 bg-black opacity-60"></div> // Keep opacity as is or adjust (e.g., 50-70)
                )}
                {animatedGradient && (
                    // You can have different admin/public gradients if desired
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-25 mix-blend-overlay animate-gradient-slow"></div>
                )}
                {/* Consistent bottom gradient - ensure this provides enough contrast for text near bottom if navbar isn't always opaque */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5  0 to-black/70"></div>{" "}
                {/* Made bottom gradient slightly more opaque */}
            </div>
        </div>
    );
};

export default FullScreenBackground;
