"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
} from "@/components/ui/form";
import { useForm, FormProvider } from "react-hook-form";

export default function LoginPage() {
    const router = useRouter();
    const formMethods = useForm<{ email: string; password: string }>({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = async (data: { email: string; password: string }) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            setErrorMessage(
                "Login failed. Please check your credentials or verify your email."
            );
        } else {
            router.replace("/");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="max-w-md w-full p-6 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center">Log In</h2>
                <FormProvider {...formMethods}>
                    <form
                        onSubmit={formMethods.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-4"
                    >
                        <FormField
                            control={formMethods.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            value={field.value || ""}
                                            required
                                            autoComplete="email"
                                            placeholder="E-Mail"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={formMethods.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                            value={field.value || ""}
                                            required
                                            autoComplete="current-password"
                                            placeholder="Password"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Log In</Button>
                    </form>
                </FormProvider>

                {errorMessage && (
                    <p className="mt-4 text-sm text-center text-red-500">
                        {errorMessage}
                    </p>
                )}
            </div>
        </div>
    );
}
