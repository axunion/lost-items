import { Button as KButton } from "@kobalte/core/button";
import { type Component, type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

type ButtonProps = {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: Component<ButtonProps> = (props) => {
	const [local, others] = splitProps(props, [
		"variant",
		"size",
		"class",
		"children",
	]);

	const variants = {
		default:
			"bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
		destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
		outline:
			"border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100",
		secondary:
			"bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
		ghost: "text-slate-700 hover:bg-slate-100 active:bg-slate-200",
		link: "text-indigo-600 underline-offset-4 hover:underline",
	};

	const sizes = {
		default: "h-12 px-6 py-3 text-base",
		sm: "h-10 px-4 text-sm",
		lg: "h-14 px-8 text-lg",
		icon: "h-12 w-12",
	};

	return (
		<KButton
			class={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				variants[local.variant ?? "default"],
				sizes[local.size ?? "default"],
				local.class,
			)}
			{...others}
		>
			{local.children}
		</KButton>
	);
};

export { Button };
