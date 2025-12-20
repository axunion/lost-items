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
		default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
		destructive:
			"bg-destructive text-destructive-foreground hover:bg-destructive/90",
		outline:
			"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
		secondary:
			"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		link: "text-primary underline-offset-4 hover:underline",
	};

	const sizes = {
		default: "h-12 px-6 py-3 text-[15px]",
		sm: "h-10 rounded-full px-4 text-xs",
		lg: "h-14 rounded-full px-8 text-base",
		icon: "h-12 w-12",
	};

	return (
		<KButton
			class={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
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
