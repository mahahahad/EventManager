import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FORTY_TWO_CLIENT_ID = process.env.FORTY_TWO_CLIENT_ID!;
const FORTY_TWO_CLIENT_SECRET = process.env.FORTY_TWO_CLIENT_SECRET!;

// 42 Abu Dhabi Campus_ID
const CAMPUS_ID = 43;

export async function GET() {
    try {
        // Step 1: Get 42 access token
        const tokenRes = await fetch("https://api.intra.42.fr/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: FORTY_TWO_CLIENT_ID,
                client_secret: FORTY_TWO_CLIENT_SECRET,
            }),
        });

        const { access_token } = await tokenRes.json();

        // Step 2: Fetch events from 42 API
        const now = new Date().toISOString();
        const future = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 30
        ).toISOString(); // 30 days from now

        const eventsRes = await fetch(
            `https://api.intra.42.fr/v2/campus/${CAMPUS_ID}/events?range[begin_at]=${now},${future}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const events = await eventsRes.json();

        // Step 3: Upsert into Supabase
        const upsertData = events.map((event: any) => ({
            title: event.name,
            description: event.description,
            location: event.location,
            start_time: event.begin_at,
            end_time: event.end_at,
            source: "intra_42",
            external_id: event.id,
            image_url: event.banner,
        }));

        const { error } = await supabase
            .from("events")
            .upsert(upsertData, { onConflict: "external_id" });

        if (error) throw error;

        return NextResponse.json({
            message: "Events synced",
            count: upsertData.length,
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
