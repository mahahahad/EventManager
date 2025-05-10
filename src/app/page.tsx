import AuthButtons from "@/components/Auth";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Register from "@/components/Register";
import EventsTable from "@/components/EventsTable";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <EventsTable />
        </div>
    );
}
