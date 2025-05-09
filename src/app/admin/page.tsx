import EventForm from "@/components/EventForm";
import AddEvent from "./addEvent";
import EditEvent from "./editEvent";
import { supabase } from "@/lib/supabaseClient";

export default async function AdminPage() {
    const { data: events = [], error } = await supabase
        .from("events")
        .select("*");

    const deleteEvent = async (id: string) => {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) {
            console.error("Error deleting event:", error);
            alert("Something went wrong 😢 Try again!");
        } else {
            alert("Event deleted successfully! 🎉");
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <EventForm />
            {/* <AddEvent /> */}
            <ul>
                {events?.map((event) => (
                    <li key={event.id}>
                        <strong>{event.title}</strong> - {event.date}
                        <EditEvent event={event} />
                        <button onClick={() => deleteEvent(event.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
