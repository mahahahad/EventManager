"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { parse } from "papaparse";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { parseISO, isValid, parse as parseDate } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FullScreenBackground from "@/components/FullScreenBackground";
import AdminNavbar from "@/components/AdminNavbar";

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

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
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
        const csvResult = parse<CsvEventRow>(e.target?.result as string, {
          header: true,
          skipEmptyLines: true,
        });

        const { data, errors } = csvResult;

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

        const validEvents: any[] = [];

        for (const row of data) {
          if (row.title && row.description && row.start_time) {
            let parsedStartTime = tryParseDate(row.start_time);

            if (!isValid(parsedStartTime)) {
              setError(
                `Invalid start time format: "${row.start_time}". Please use a format like YYYY-MM-DD HH:mm.`
              );
              setLoading(false);
              return;
            }

            let parsedEndTime: string | null = null;
            if (row.end_time) {
              const parsedEnd = tryParseDate(row.end_time);
              if (isValid(parsedEnd)) {
                parsedEndTime = parsedEnd.toISOString();
              }
            }

            validEvents.push({
              title: row.title,
              description: row.description,
              start_time: parsedStartTime.toISOString(),
              end_time: parsedEndTime,
              location: row.location || "",
              is_public:
                row.is_public === "true" || row.is_public === true || false,
              source: row.source || "local",
              image_url: row.image_url || "",
              external_id: row.external_id
                ? parseInt(String(row.external_id), 10) || null
                : null,
              created_by: row.created_by ? String(row.created_by) : null,
            });
          } else {
            setError(
              "CSV data is missing required fields (title, description, start_time)."
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

  const tryParseDate = (input: string): Date => {
    const formats = [
      "yyyy-MM-dd HH:mm",
      "dd/MM/yyyy HH:mm",
      "MM/dd/yyyy HH:mm",
      "yyyy-MM-dd",
      "dd/MM/yyyy",
      "MM/dd/yyyy",
    ];

    for (const format of formats) {
      const parsed = parseDate(input, format, new Date());
      if (isValid(parsed)) return parsed;
    }

    const isoParsed = parseISO(input);
    return isValid(isoParsed) ? isoParsed : new Date(NaN);
  };

  return (
    <div className="relative min-h-screen">
      <FullScreenBackground
        imageUrl="https://images.unsplash.com/photo-1495435286966-9b1f1b585328"
        animatedGradient
        blur
        darkOverlay
      />
      <div className="absolute inset-0 pt-20 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-start z-10">
        <AdminNavbar />
        <div className="max-w-4xl w-full mt-16 space-y-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Import Events from CSV
          </h1>

          <div className="bg-black/50 p-6 rounded-3xl border border-gray-700 shadow-lg space-y-5">
            <div className="text-sm text-gray-300">
              <p className="font-semibold">Required CSV Fields:</p>
              <ul className="list-disc pl-5 mb-2">
                <li><strong>title</strong> – event name.</li>
                <li><strong>description</strong> – brief event description.</li>
                <li>
                  <strong>start_time</strong> – accepted formats:
                  <code className="ml-1">YYYY-MM-DD HH:mm</code>,
                  <code className="ml-1">DD/MM/YYYY HH:mm</code>,
                  <code className="ml-1">MM/DD/YYYY</code>, etc.
                </li>
              </ul>
              <p className="text-gray-400">
                Optional: <em>location, end_time, is_public, source, image_url, external_id, created_by</em>
              </p>
            </div>

            <div>
              <Label htmlFor="csvFile">Select CSV File</Label>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <Button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
            >
              {loading ? "Importing..." : "Import CSV"}
            </Button>
          </div>

          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <IoArrowBack size={18} /> Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminImportCSVPage;
