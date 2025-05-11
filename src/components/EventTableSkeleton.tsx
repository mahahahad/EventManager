// components/EventTableSkeleton.tsx
import React from "react";

const EventTableSkeleton = () => {
    return (
        <div className="w-full backdrop-blur-xl bg-black/40 shadow-2xl shadow-blue-500/10 rounded-xl p-4 sm:p-6 space-y-6 border border-gray-700/50 relative animate-pulse">
            <table className="w-full table-auto text-left">
                <thead className="border-b border-gray-700">
                    <tr>
                        <th className="py-2 px-4 text-left text-gray-400 font-semibold w-32 overflow-hidden text-ellipsis">
                            <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
                        </th>
                        <th className="py-2 px-4 text-left text-gray-400 font-semibold w-40 overflow-hidden text-ellipsis">
                            <div className="h-4 bg-gray-700 rounded-md w-2/3"></div>
                        </th>
                        <th className="py-2 px-4 text-left text-gray-400 font-semibold w-24 overflow-hidden text-ellipsis">
                            <div className="h-4 bg-gray-700 rounded-md w-1/3"></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 border-b border-gray-800">
                                <div className="h-4 bg-gray-700 rounded-md w-2/3"></div>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-800">
                                <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
                            </td>
                            <td className="py-2 px-4 border-b border-gray-800">
                                <div className="h-4 bg-gray-700 rounded-md w-1/3"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventTableSkeleton;
