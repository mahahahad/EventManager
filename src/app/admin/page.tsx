"use client";

import React from "react";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FullScreenBackground from "@/components/FullScreenBackground";

const AdminDashboardPage = () => {
    return (
        <div className="relative min-h-screen">
            <FullScreenBackground
                imageUrl="https://images.unsplash.com/photo-1493246515717-a0899e1c062a"
                animatedGradient={true}
                blur={true}
                darkOverlay={true}
            />
            <div className="absolute inset-0 pt-20 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start">
                <AdminNavbar />
                <div className="max-w-4xl w-full mx-auto space-y-6 relative z-10 mt-16">
                    {" "}
                    {/* Added mt-16 */}
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Welcome to the admin dashboard! Manage your site&apos;s
                        content.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <Card className="bg-black/50 border-gray-700 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">
                                    Manage Events
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Create, edit, and delete events.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/admin/events">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20",
                                            "text-white border-blue-500/30 hover:border-blue-500/50",
                                            "hover:from-blue-500/30 hover:to-purple-500/30",
                                            "transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                                        )}
                                    >
                                        Go to Events Management
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
