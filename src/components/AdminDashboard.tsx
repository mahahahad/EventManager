"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        start_time: "",
        image_url: "",
        is_public: true,
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return router.push("/");
            const { data, error } = await supabase
                .from("users")
                .select("is_admin")
                .eq("email", user.email)
                .single();
            if (error || !data?.is_admin) router.push("/");
        };

        checkAdmin();
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("date", { ascending: true });
        if (!error && data) setEvents(data);
    };

    const handleDelete = async (id: number) => {
        await supabase.from("events").delete().eq("id", id);
        fetchEvents();
    };

    const handleEdit = (event: any) => {
        setEditingId(event.id);
        setFormData({
            title: event.title,
            description: event.description,
            location: event.location,
            start_time: event.start_time,
            image_url: event.image_url ?? "",
            is_public: event.is_public,
        });
    };

    const handleSubmit = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            setMessage("You must be logged in as an admin to create events.");
            return;
        }

        const newEvent = { ...formData, created_by: user.id };

        if (editingId) {
            await supabase.from("events").update(newEvent).eq("id", editingId);
            setEditingId(null);
        } else {
            await supabase.from("events").insert(newEvent);
        }

        setFormData({
            title: "",
            description: "",
            location: "",
            start_time: "",
            image_url: "",
            is_public: true,
        });
        fetchEvents();
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-4">
                {events.map((event) => (
                    <Card key={event.id}>
                        <CardContent className="p-4">
                            <h2 className="text-xl font-semibold">
                                {event.title}
                            </h2>
                            <p className="text-sm text-muted-foreground mb-2">
                                {new Date(event.start_date).toLocaleString()}
                            </p>
                            <p className="mb-4">{event.description}</p>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleEdit(event)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(event.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="border-t pt-6">
                <h2 className="text-2xl font-semibold mb-4">
                    {editingId ? "Edit Event" : "Create New Event"}
                </h2>
                <div className="space-y-4 max-w-lg">
                    <label>Title</label>
                    <Input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />

                    <label>Description</label>
                    <Textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                    />

                    <label>Start Time</label>
                    <Input
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                start_time: e.target.value,
                            })
                        }
                    />

                    <label>Location</label>
                    <Input
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                    />

                    <label>Image URL (Optional)</label>
                    <Input
                        placeholder="Image URL"
                        value={formData.image_url}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                image_url: e.target.value,
                            })
                        }
                    />

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.is_public}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_public: e.target.checked,
                                })
                            }
                        />
                        <span>Is Public</span>
                    </label>

                    <Button onClick={handleSubmit}>
                        {editingId ? "Update Event" : "Create Event"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
