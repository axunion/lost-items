import * as TextFieldPrimitive from "@kobalte/core/text-field";
import { type Component, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

type InputProps = TextFieldPrimitive.TextFieldRootProps & {
	label?: string;
	error?: string;
	class?: string;
};

const Input: Component<InputProps> = (props) => {
	const [local, others] = splitProps(props, ["label", "error", "class"]);

	return (
		<TextFieldPrimitive.Root
			class={cn("flex flex-col gap-1.5", local.class)}
			validationState={local.error ? "invalid" : "valid"}
			{...others}
		>
			{local.label && (
				<TextFieldPrimitive.Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{local.label}
				</TextFieldPrimitive.Label>
			)}
			<TextFieldPrimitive.Input
				class={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				)}
			/>
			{local.error && (
				<TextFieldPrimitive.ErrorMessage class="text-sm font-medium text-destructive">
					{local.error}
				</TextFieldPrimitive.ErrorMessage>
			)}
		</TextFieldPrimitive.Root>
	);
};

export { Input };
