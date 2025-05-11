"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Event } from "@/types/event";
import { parse } from "papaparse";

interface CsvEventRow {
    title: string;
    location: string;
    start_time: string;
    end_time: string;
    description?: string;
    is_public: string | boolean;
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
                    if (
                        row.title &&
                        row.location &&
                        row.start_time &&
                        row.end_time &&
                        row.is_public !== undefined
                    ) {
                        validEvents.push({
                            title: row.title,
                            location: row.location,
                            start_time: row.start_time,
                            end_time: row.end_time,
                            description: row.description || "",
                            is_public:
                                row.is_public === "true" ||
                                row.is_public === true,
                            source: row.source || "",
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
                            "CSV data is missing required fields. Please check your file."
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
        <div className="p-6 space-y-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Bulk CSV Import</h2>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mb-4"
            />
            <button
                onClick={handleImport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
            >
                {loading ? "Importing..." : "Import CSV"}
            </button>
            {error && <p className="text-red-500">{error}</p>}
            {loading && <p>Importing events...</p>}
        </div>
    );
};

export default AdminImportCSVPage;
