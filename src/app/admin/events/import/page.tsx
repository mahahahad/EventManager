// src/app/admin/events/import/page.tsx
"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    DragEvent,
    useRef,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { parse } from "papaparse";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { parseISO, isValid, parse as parseDateFn } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Label is used for non-clickable text labels
import FullScreenBackground from "@/components/FullScreenBackground";
import AdminNavbar from "@/components/AdminNavbar";
import {
    UploadCloud,
    AlertCircle,
    CheckCircle,
    Loader2,
    FileText,
    X,
} from "lucide-react"; // Added FileText and X
import { cn } from "@/lib/utils";

interface CsvEventRow {
    title?: string;
    description?: string;
    start_time?: string;
    location?: string;
    end_time?: string;
    is_public?: string | boolean;
    source?: string;
    image_url?: string;
    external_id?: string | number;
}

type EventInsert = {
    title: string;
    description: string | null;
    start_time: string; // ISO string
    end_time: string | null; // ISO string or null
    location: string | null;
    is_public: boolean;
    source: string;
    image_url: string | null;
    external_id: number | null;
    created_by: string;
};

const getCurrentUserId = async (): Promise<string | null> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
};

const AdminImportCSVPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error || successMessage) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [error, successMessage]);

    const processFile = useCallback((selectedFile: File | null) => {
        setSuccessMessage(null);
        setError(null);
        if (selectedFile) {
            if (
                selectedFile.type === "text/csv" ||
                selectedFile.name.endsWith(".csv")
            ) {
                setFile(selectedFile);
            } else {
                setError("Invalid file type. Please upload a CSV file.");
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } else {
            setFile(null);
        }
    }, []); // Empty dependency array as it doesn't depend on component state being changed within it

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFile(e.target.files?.[0] || null);
    };

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processFile(e.dataTransfer.files[0]);
                e.dataTransfer.clearData();
            }
        },
        [processFile]
    );

    const handleDragOver = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDragging) setIsDragging(true);
        },
        [isDragging]
    );

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const dropzone = e.currentTarget as HTMLDivElement;
        if (
            e.relatedTarget instanceof Node &&
            !dropzone.contains(e.relatedTarget as Node)
        ) {
            setIsDragging(false);
        } else if (!e.relatedTarget) {
            // handles leaving window boundary
            setIsDragging(false);
        }
    }, []);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const tryParseDate = (input: string): Date => {
        if (!input || input.trim() === "") return new Date(NaN);
        const isoParsed = parseISO(input.trim());
        if (isValid(isoParsed)) return isoParsed;
        const formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "dd/MM/yyyy HH:mm:ss",
            "dd/MM/yyyy HH:mm",
            "MM/dd/yyyy HH:mm:ss",
            "MM/dd/yyyy HH:mm",
            "yyyy-MM-dd",
            "dd/MM/yyyy",
            "MM/dd/yyyy",
        ];
        for (const format of formats) {
            const parsed = parseDateFn(input.trim(), format, new Date());
            if (isValid(parsed)) return parsed;
        }
        return new Date(NaN);
    };

    const handleImport = async () => {
        if (!file) {
            setError("Please select a CSV file to import.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
            setError("Authentication error. Please ensure you are logged in.");
            setLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                if (!e.target || typeof e.target.result !== "string") {
                    setError("Could not read file content.");
                    setLoading(false);
                    return;
                }
                const csvText = e.target.result;
                const csvResult = parse<CsvEventRow>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: (header) =>
                        header.trim().toLowerCase().replace(/\s+/g, "_"),
                });
                const { data, errors: parseErrors } = csvResult;

                if (parseErrors.length > 0) {
                    console.error("CSV Parsing Errors:", parseErrors);
                    setError(
                        `Error parsing CSV on row ${
                            (parseErrors[0]?.row ?? -1) + 2
                        }: ${
                            parseErrors[0]?.message ?? "Unknown error"
                        }. Check headers and quotes.`
                    );
                    setLoading(false);
                    return;
                }
                if (data.length === 0) {
                    setError("CSV file is empty or contains no data rows.");
                    setLoading(false);
                    return;
                }

                const validEventsToInsert: EventInsert[] = [];
                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const rowNumber = i + 2;
                    if (
                        !row.title ||
                        !row.title.trim() ||
                        !row.start_time ||
                        !row.start_time.trim()
                    ) {
                        setError(
                            `Row ${rowNumber}: Missing required value for 'title' or 'start_time'.`
                        );
                        setLoading(false);
                        return;
                    }
                    const parsedStartTime = tryParseDate(row.start_time);
                    if (!isValid(parsedStartTime)) {
                        setError(
                            `Row ${rowNumber}: Invalid start_time format for "${row.start_time}".`
                        );
                        setLoading(false);
                        return;
                    }
                    let parsedEndTime: string | null = null;
                    if (row.end_time && row.end_time.trim() !== "") {
                        const parsedEnd = tryParseDate(row.end_time);
                        if (isValid(parsedEnd))
                            parsedEndTime = parsedEnd.toISOString();
                        else
                            console.warn(
                                `Row ${rowNumber}: Invalid end_time "${row.end_time}", skipping end time.`
                            );
                    }
                    let isPublicValue = true;
                    if (row.is_public !== undefined && row.is_public !== null) {
                        if (typeof row.is_public === "string") {
                            const val = row.is_public.trim().toLowerCase();
                            isPublicValue =
                                val === "true" || val === "1" || val === "yes";
                        } else if (typeof row.is_public === "boolean") {
                            isPublicValue = row.is_public;
                        }
                    }
                    let externalIdValue: number | null = null;
                    if (
                        row.external_id !== undefined &&
                        row.external_id !== null &&
                        String(row.external_id).trim() !== ""
                    ) {
                        const parsedExtId = parseInt(
                            String(row.external_id).trim(),
                            10
                        );
                        if (!isNaN(parsedExtId)) externalIdValue = parsedExtId;
                        else
                            console.warn(
                                `Row ${rowNumber}: Invalid external_id "${row.external_id}", setting to null.`
                            );
                    }
                    validEventsToInsert.push({
                        title: row.title.trim(),
                        description: row.description
                            ? row.description.trim()
                            : null,
                        start_time: parsedStartTime.toISOString(),
                        end_time: parsedEndTime,
                        location: row.location ? row.location.trim() : null,
                        is_public: isPublicValue,
                        source: row.source ? row.source.trim() : "local",
                        image_url: row.image_url ? row.image_url.trim() : null,
                        external_id: externalIdValue,
                        created_by: currentUserId,
                    });
                }
                if (validEventsToInsert.length > 0) {
                    const { error: insertError } = await supabase
                        .from("events")
                        .insert(validEventsToInsert);
                    if (insertError) {
                        console.error("Error inserting events:", insertError);
                        setError(
                            `Failed to import events: ${insertError.message}`
                        );
                    } else {
                        setSuccessMessage(
                            `${validEventsToInsert.length} event(s) imported successfully!`
                        );
                        setFile(null);
                        const fileInput = document.getElementById(
                            "csvFile"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                    }
                } else {
                    setError(
                        "No valid events found to import after processing the CSV."
                    );
                }
            } catch (processError: any) {
                console.error("Error processing file:", processError);
                setError(
                    `Failed to process CSV: ${
                        processError.message ||
                        "Unknown error during processing."
                    }`
                );
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="relative min-h-screen text-white">
            <FullScreenBackground />
            <div className="relative z-10 pt-24 pb-32 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-start min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }}
                    className="w-full max-w-2xl bg-black/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-700/50 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">
                            Import Events via CSV
                        </h1>
                        <Button
                            onClick={() => router.push("/admin/events")}
                            variant="outline"
                            className="!p-4 rounded-full text-gray-300 border-gray-600 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <IoArrowBack size={18} /> Back
                        </Button>
                    </div>

                    <div className="mb-8 p-4 bg-neutral-800/50 rounded-xl border border-gray-700 text-sm text-gray-300 space-y-2">
                        <p className="font-semibold text-gray-100">
                            CSV File Format Guide:
                        </p>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-gray-400">
                            <li>
                                First row must be headers (e.g.,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded text-sky-300">
                                    title
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded text-sky-300">
                                    start_time
                                </code>
                                ).
                            </li>
                            <li>
                                Required:{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded text-sky-300">
                                    title
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded text-sky-300">
                                    start_time
                                </code>
                                .
                            </li>
                            <li>
                                Optional:{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    description
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    location
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    end_time
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    is_public
                                </code>{" "}
                                (true/false/1/0),{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    source
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    image_url
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    external_id
                                </code>
                                .
                            </li>
                            <li>
                                Date/Time examples:{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    YYYY-MM-DD HH:mm
                                </code>
                                ,{" "}
                                <code className="bg-neutral-700 px-1 py-0.5 rounded">
                                    MM/DD/YYYY HH:mm
                                </code>
                                , ISO8601.
                            </li>
                        </ul>
                        <p className="text-xs text-gray-500 pt-1">
                            Headers are case-insensitive and spaces will be
                            replaced by underscores (e.g., "Start Time" becomes
                            "start_time").
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label className="block text-sm font-medium text-gray-300 mb-2">
                                Select or Drag CSV File
                            </Label>
                            <div
                                onClick={triggerFileInput}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={cn(
                                    "mt-1 flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200",
                                    isDragging
                                        ? "border-sky-500 bg-sky-900/30"
                                        : "border-gray-600 bg-neutral-800/40 hover:border-sky-600"
                                )}
                            >
                                <UploadCloud
                                    className={cn(
                                        "mx-auto h-12 w-12 text-gray-500 transition-colors",
                                        isDragging && "text-sky-400"
                                    )}
                                />
                                <div className="flex text-sm text-gray-400 mt-2">
                                    <span className="font-medium text-sky-400 group-hover:text-sky-300">
                                        Click to upload
                                    </span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    CSV up to 10MB
                                </p>
                                <input
                                    ref={fileInputRef}
                                    id="csvFile"
                                    name="csvFile"
                                    type="file"
                                    className="sr-only"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {file && (
                                <div className="mt-4 p-3 bg-neutral-700/50 rounded-lg border border-gray-600 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-sky-300 font-medium">
                                        <FileText className="w-5 h-5 text-sky-400" />
                                        <span>{file.name}</span>
                                        <span className="text-xs text-gray-400">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setFile(null);
                                            if (fileInputRef.current)
                                                fileInputRef.current.value = "";
                                        }}
                                        className="text-gray-400 hover:text-red-400 h-7 w-7"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 text-red-400 bg-red-900/30 p-4 rounded-lg border border-red-700/50">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="flex items-start gap-3 text-green-400 bg-green-900/30 p-4 rounded-lg border border-green-700/50">
                                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleImport}
                            disabled={loading || !file}
                            className={cn(
                                "w-full text-white font-semibold !p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/30 mt-8 flex items-center justify-center gap-2",
                                loading || !file
                                    ? "bg-gray-600 cursor-not-allowed opacity-70"
                                    : "bg-sky-600 hover:bg-sky-500"
                            )}
                        >
                            {loading && (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            )}
                            {loading
                                ? "Importing..."
                                : "Import Events from CSV"}
                        </Button>
                    </div>
                </motion.div>
            </div>
            <AdminNavbar />
        </div>
    );
};

export default AdminImportCSVPage;
