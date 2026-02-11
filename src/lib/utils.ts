import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(
	date: string | Date,
	options: Intl.DateTimeFormatOptions = {},
): string {
	const value = new Date(date);
	if (Number.isNaN(value.getTime())) return "";
	return new Intl.DateTimeFormat(undefined, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		...options,
	}).format(value);
}
