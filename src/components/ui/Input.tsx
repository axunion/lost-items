import * as TextField from "@kobalte/core/text-field";
import { type Component, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

type InputProps = {
	label?: string;
	error?: string;
} & TextField.TextFieldRootProps & { class?: string };

const Input: Component<InputProps> = (props) => {
	const [local, others] = splitProps(props, ["label", "error", "class"]);

	return (
		<TextField.Root
			class={cn("flex flex-col gap-1.5", local.class)}
			{...others}
		>
			{local.label && (
				<TextField.Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{local.label}
				</TextField.Label>
			)}
			<TextField.Input
				class={cn(
					"flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-base shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
				)}
			/>
			{local.error && (
				<TextField.ErrorMessage class="text-sm font-medium text-red-500">
					{local.error}
				</TextField.ErrorMessage>
			)}
		</TextField.Root>
	);
};

export { Input };
