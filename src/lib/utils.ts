import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | number): string {
    let dateObj: Date;
    if (typeof date === "number") {
        dateObj = new Date(date);
    } else {
        dateObj = new Date(date);
    }
    return dateObj.toLocaleDateString(); // Or your desired format
}
