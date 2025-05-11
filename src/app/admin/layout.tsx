// src/app/admin/layout.tsx
import Navbar from "@/components/Navbar"; // The main top navbar
import AdminNavbar from "@/components/AdminNavbar"; // The new bottom admin navbar

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar /> {/* Always at the top */}
            {children}
            <AdminNavbar /> {/* Always at the bottom (for admin section) */}
        </>
    );
}
