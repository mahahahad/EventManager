import Link from "next/link";

const AdminNavbar = () => {
    return (
        <nav className="bg-neutral-900 py-4 text-white">
            <div className="container mx-auto flex items-center justify-between px-6">
                <Link href="/admin" className="text-xl font-bold">
                    Admin Panel
                </Link>
                <div>
                    <Link
                        href="/admin/events"
                        className="mr-4 hover:text-gray-300"
                    >
                        Events
                    </Link>
                    <Link
                        href="/admin/events/create"
                        className="mr-4 hover:text-gray-300"
                    >
                        Create Event
                    </Link>
                    {/* Add other admin navigation links here */}
                </div>
                <Link href="/" className="hover:text-gray-300">
                    Back to Site
                </Link>
            </div>
        </nav>
    );
};

export default AdminNavbar;
