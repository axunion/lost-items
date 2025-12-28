import type { PolymorphicProps } from "@kobalte/core";
import * as TextFieldPrimitive from "@kobalte/core/text-field";
import { cva } from "class-variance-authority";
import type { ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";

import { cn } from "~/lib/utils";

type TextFieldRootProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldRootProps<T> & {
		class?: string | undefined;
	};

const TextField = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldRootProps, ["class"]);
	return (
		<TextFieldPrimitive.Root
			class={cn("flex flex-col gap-1", local.class)}
			{...others}
		/>
	);
};

type TextFieldInputProps<T extends ValidComponent = "input"> =
	TextFieldPrimitive.TextFieldInputProps<T> & {
		class?: string | undefined;
		type?:
			| "button"
			| "checkbox"
			| "color"
			| "date"
			| "datetime-local"
			| "email"
			| "file"
			| "hidden"
			| "image"
			| "month"
			| "number"
			| "password"
			| "radio"
			| "range"
			| "reset"
			| "search"
			| "submit"
			| "tel"
			| "text"
			| "time"
			| "url"
			| "week";
	};

const TextFieldInput = <T extends ValidComponent = "input">(
	rawProps: PolymorphicProps<T, TextFieldInputProps<T>>,
) => {
	const props = mergeProps<TextFieldInputProps<T>[]>(
		{ type: "text" },
		rawProps,
	);
	const [local, others] = splitProps(props as TextFieldInputProps, [
		"type",
		"class",
	]);
	return (
		<TextFieldPrimitive.Input
			type={local.type}
			class={cn(
				"flex h-10 w-full rounded-md border border-input/50 bg-transparent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-invalid:border-error-foreground data-invalid:text-error-foreground",
				local.class,
			)}
			{...others}
		/>
	);
};

type TextFieldTextAreaProps<T extends ValidComponent = "textarea"> =
	TextFieldPrimitive.TextFieldTextAreaProps<T> & { class?: string | undefined };

const TextFieldTextArea = <T extends ValidComponent = "textarea">(
	props: PolymorphicProps<T, TextFieldTextAreaProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldTextAreaProps, [
		"class",
	]);
	return (
		<TextFieldPrimitive.TextArea
			class={cn(
				"flex min-h-[80px] w-full rounded-md border border-input/50 bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				local.class,
			)}
			{...others}
		/>
	);
};

const labelVariants = cva(
	"text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-invalid:text-destructive",
);

type TextFieldLabelProps<T extends ValidComponent = "label"> =
	TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined };

const TextFieldLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldLabelProps, ["class"]);
	return (
		<TextFieldPrimitive.Label
			class={cn(labelVariants(), local.class)}
			{...others}
		/>
	);
};

export { TextField, TextFieldInput, TextFieldTextArea, TextFieldLabel };
