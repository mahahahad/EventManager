// components/FullScreenBackground.tsx
import React from "react";

interface Props {
    imageUrl: string;
    animatedGradient?: boolean;
    blur?: boolean;
    darkOverlay?: boolean;
}

const FullScreenBackground: React.FC<Props> = ({
    imageUrl,
    animatedGradient,
    blur,
    darkOverlay,
}) => {
    return (
        <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 sm:opacity-30 ${
                        blur ? "blur-sm" : ""
                    }`}
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                ></div>
                {darkOverlay && (
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                )}
                {animatedGradient && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 mix-blend-overlay animate-gradient-slow"></div>
                )}
                {/* Consistent bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-b   from-transparent  to-black"></div>
            </div>
        </div>
    );
};

export default FullScreenBackground;
