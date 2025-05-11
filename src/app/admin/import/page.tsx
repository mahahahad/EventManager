// src/pages/admin/import.tsx
"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { parse } from "papaparse";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5"; // Import back arrow icon
import AdminNavbar from "@/components/AdminNavbar"; // Ensure AdminNavbar is imported
import { parseISO, isValid, parse as parseDate } from "date-fns"; // Import date parsing functions

interface CsvEventRow {
    title: string;
    description: string;
    start_time: string;
    location?: string;
    end_time?: string;
    is_public?: string | boolean;
    source?: string;
    image_url?: string;
    external_id?: string | number;
    created_by?: string;
}

const AdminImportCSVPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError("Please select a CSV file.");
            return;
        }

        setLoading(true);
        setError(null);

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const csvResult = parse<CsvEventRow>(
                    e.target?.result as string,
                    {
                        header: true,
                        skipEmptyLines: true,
                    }
                );
                const { data, errors, meta } = csvResult;

                if (errors.length > 0) {
                    setError(`Error parsing CSV: ${errors[0].message}`);
                    setLoading(false);
                    return;
                }

                if (data.length === 0) {
                    setError("CSV file is empty or has no valid data.");
                    setLoading(false);
                    return;
                }

                const validEvents: Omit<
                    Event,
                    "id" | "created_at" | "updated_at"
                >[] = [];
                for (const row of data) {
                    if (row.title && row.description && row.start_time) {
                        let parsedStartTime: Date | null = null;

                        parsedStartTime = parseISO(row.start_time);
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "dd/MM/yyyy HH:mm",
                                new Date()
                            );
                        }
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "MM/dd/yyyy HH:mm",
                                new Date()
                            );
                        }
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "yyyy-MM-dd HH:mm",
                                new Date()
                            );
                        }
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "dd/MM/yyyy",
                                new Date()
                            );
                        }
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "MM/dd/yyyy",
                                new Date()
                            );
                        }
                        if (!isValid(parsedStartTime)) {
                            parsedStartTime = parseDate(
                                row.start_time,
                                "yyyy-MM-dd",
                                new Date()
                            );
                        }

                        if (parsedStartTime && isValid(parsedStartTime)) {
                            let parsedEndTime: string | null = null;
                            if (row.end_time) {
                                const endTimeDate = parseISO(row.end_time);
                                if (isValid(endTimeDate)) {
                                    parsedEndTime = endTimeDate.toISOString();
                                } else {
                                    const endTimeDateAlt = parseDate(
                                        row.end_time,
                                        "dd/MM/yyyy HH:mm",
                                        new Date()
                                    );
                                    if (isValid(endTimeDateAlt)) {
                                        parsedEndTime =
                                            endTimeDateAlt.toISOString();
                                    }
                                }
                            }

                            validEvents.push({
                                title: row.title,
                                description: row.description,
                                start_time: parsedStartTime.toISOString(),
                                location: row.location || "",
                                end_time: parsedEndTime,
                                is_public:
                                    row.is_public === "true" ||
                                    row.is_public === true,
                                source: "local", // Default source value
                                image_url: row.image_url || "",
                                external_id: row.external_id
                                    ? parseInt(String(row.external_id), 10)
                                    : null,
                                created_by: row.created_by
                                    ? String(row.created_by)
                                    : null,
                            });
                        } else {
                            setError(
                                `Invalid start time format: "${row.start_time}". Please use a format like YYYY-MM-DD HH:mm, MM/DD/YYYY HH:mm, or DD/MM/YYYY HH:mm.`
                            );
                            setLoading(false);
                            return;
                        }
                    } else {
                        setError(
                            "CSV data is missing required fields (title, description, start_time). Please check your file."
                        );
                        setLoading(false);
                        return;
                    }
                }

                if (validEvents.length > 0) {
                    const { error: insertError } = await supabase
                        .from("events")
                        .insert(validEvents);

                    if (insertError) {
                        console.error("Error inserting events:", insertError);
                        setError("Failed to import events.");
                    } else {
                        console.log(
                            `Successfully imported ${validEvents.length} events.`
                        );
                        router.push("/admin/events");
                    }
                } else {
                    setError("No valid events found in the CSV file.");
                }
            } catch (parseError) {
                console.error("Error parsing CSV:", parseError);
                setError("Failed to parse CSV file.");
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-neutral-800 min-h-screen">
            <AdminNavbar />
            <div className="flex justify-center items-center p-4 z-10">
                <Link
                    href="/admin/events"
                    className="fixed top-4 left-4 bg-black/40 hover:bg-black/60 text-white font-semibold py-2 px-3 rounded-full transition z-20"
                >
                    <IoArrowBack size={20} className="inline-block mr-1" /> Back
                </Link>
                <div className="relative bg-black/30 backdrop-blur-lg shadow-lg rounded-[48px] w-[95%] md:w-[85%] h-auto max-h-[90%] overflow-auto p-6 sm:px-8 py-8 border border-black/40 dark:bg-gray-800/70 dark:border-gray-600 dark:text-gray-200 text-white flex flex-col items-start">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 self-start">
                        Bulk CSV Import
                    </h2>
                    <div className="mb-4 w-full">
                        <p className="font-semibold">Required CSV Fields:</p>
                        <ul className="list-disc pl-5 mb-2">
                            <li>
                                <span className="font-bold">title</span>{" "}
                                (string): The name of the event.
                            </li>
                            <li>
                                <span className="font-bold">description</span>{" "}
                                (string): A brief description of the event.
                            </li>
                            <li>
                                <span className="font-bold">start_time</span>{" "}
                                (string): The date and time the event starts
                                (e.g., YYYY-MM-DD HH:mm, MM/DD/YYYY HH:mm,{" "}
                                <span className="font-bold">
                                    DD/MM/YYYY HH:mm
                                </span>
                                ).
                            </li>
                        </ul>
                        <p className="text-gray-400">
                            The following fields are optional:{" "}
                            <span className="font-italic">
                                location, end_time (YYYY-MM-DD HH:mm or other
                                recognizable formats), is_public, source,
                                image_url, external_id, created_by
                            </span>
                            .
                        </p>
                        <p className="text-gray-400">
                            Rows missing the required fields will not be
                            imported. Ensure the date and time for{" "}
                            <span className="font-bold">start_time</span> and{" "}
                            <span className="font-italic">end_time</span> are in
                            a recognizable format.
                        </p>
                    </div>
                    <label
                        htmlFor="csvFile"
                        className="block text-sm font-medium text-gray-300 mb-2 self-start"
                    >
                        Select CSV File:
                    </label>
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                    />
                    <button
                        onClick={handleImport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors duration-300 shadow-md self-start"
                        disabled={loading}
                    >
                        {loading ? "Importing..." : "Import CSV"}
                    </button>
                    {error && (
                        <p className="text-red-500 text-sm mt-2 self-start">
                            {error}
                        </p>
                    )}
                    {loading && (
                        <p className="text-gray-400 text-sm mt-2 self-start">
                            Importing events...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminImportCSVPage;
