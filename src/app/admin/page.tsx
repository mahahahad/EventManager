"use client";

import React from "react";
import Link from "next/link";
import AdminNavbar from "@/components/AdminNavbar"; // Import the navbar

const AdminDashboardPage = () => {
    return (
        <div className="bg-neutral-800 min-h-screen">
            <AdminNavbar /> {/* Include the navbar */}
            <div className="p-6 space-y-4 text-white">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                <p className="text-lg">Welcome to the admin dashboard!</p>

                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-2">
                        Manage Events
                    </h2>
                    <Link
                        href="/admin/events"
                        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Go to Events Management
                    </Link>
                </div>

                {/* You can add more sections here for other admin tasks */}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
