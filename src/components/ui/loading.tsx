import { LoaderCircle } from "lucide-solid";
import { type Component, mergeProps } from "solid-js";
import { cn } from "~/lib/utils";

type LoadingProps = {
	variant?: "default" | "fullscreen" | "inline";
	class?: string;
	size?: "sm" | "md" | "lg";
	text?: string;
};

const Loading: Component<LoadingProps> = (rawProps) => {
	const props = mergeProps({ variant: "default", size: "md" }, rawProps);

	const sizeClasses: Record<NonNullable<LoadingProps["size"]>, string> = {
		sm: "size-4",
		md: "size-8",
		lg: "size-12",
	};

	const Content = () => (
		<div
			class={cn(
				"flex items-center justify-center gap-3 text-muted-foreground",
				props.variant === "fullscreen" &&
					"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
				props.variant === "default" && "w-full py-12",
				props.variant === "inline" && "inline-flex w-auto py-0",
				props.class,
			)}
		>
			<LoaderCircle
				class={cn(
					"animate-spin text-primary",
					sizeClasses[props.size as keyof typeof sizeClasses],
				)}
			/>
			{props.text && (
				<span class={cn("font-medium", props.size === "sm" && "text-xs")}>
					{props.text}
				</span>
			)}
		</div>
	);

	return <Content />;
};

export default Loading;
