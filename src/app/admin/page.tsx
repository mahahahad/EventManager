"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [checked, setChecked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: authData, error: authError } =
                await supabase.auth.getUser();

            if (authError || !authData.user) {
                router.replace("/");
                return;
            }

            const email = authData.user.email;

            const { data: usersData, error: usersError } = await supabase
                .from("users")
                .select("is_admin")
                .eq("email", email)
                .single();

            if (usersError || !usersData?.is_admin) {
                router.replace("/");
                return;
            }

            setIsAdmin(true);
            setChecked(true);
        };

        checkAdmin();
    }, [router]);

    if (!isAdmin || !checked) return null;

    return (
        <div className="p-4">
            <AdminDashboard />
        </div>
    );
}
