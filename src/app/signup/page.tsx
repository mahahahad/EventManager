"use client";
import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
    const formMethods = useForm<{
        fullName: string;
        username: string;
        email: string;
        password: string;
    }>({
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
        },
    });
    const [message, setMessage] = useState("");

    const onSubmit = async (data: {
        fullName: string;
        username: string;
        email: string;
        password: string;
    }) => {
        try {
            // Step 1: Sign up the user with Supabase authentication
            const { data: authData, error: signUpError } =
                await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                });

            if (signUpError || !authData?.user) {
                setMessage("Error signing up. Please try again.");
                return;
            }

            // Step 2: Insert into the custom 'users' table
            const { error: insertError } = await supabase.from("users").upsert([
                {
                    id: authData.user.id, // ✅ Use Supabase auth user ID
                    full_name: data.fullName,
                    display_name: data.username,
                    email: data.email,
                    is_admin: false,
                },
            ]);

            if (insertError) {
                setMessage("User created but failed to save user details.");
                return;
            }

            setMessage("Check your email to verify your account!");
        } catch (err) {
            console.error("Signup error:", err);
            setMessage("Unexpected error occurred.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="max-w-md w-full p-6 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center">
                    Create an Account
                </h2>

                <FormProvider {...formMethods}>
                    <form
                        onSubmit={formMethods.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-4"
                    >
                        <FormField
                            control={formMethods.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                            required
                                            placeholder="John Smith"
                                            autoComplete="full-name"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={formMethods.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                            required
                                            placeholder="jsmith"
                                            autoComplete="username"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

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
                                            required
                                            placeholder="john@info.smith.com"
                                            autoComplete="email"
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
                                            required
                                            placeholder="Password"
                                            autoComplete="current-password"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Sign Up</Button>
                    </form>
                </FormProvider>

                {message && (
                    <p className="mt-4 text-sm text-center">{message}</p>
                )}
            </div>
        </div>
    );
}
