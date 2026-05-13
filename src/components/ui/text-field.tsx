import type { PolymorphicProps } from "@kobalte/core";
import * as TextFieldPrimitive from "@kobalte/core/text-field";
import type { ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";

import { cx } from "~/lib/utils";
import styles from "./text-field.module.css";

type TextFieldRootProps<T extends ValidComponent = "div"> =
	TextFieldPrimitive.TextFieldRootProps<T> & {
		class?: string | undefined;
	};

const TextField = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, TextFieldRootProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldRootProps, ["class"]);
	return (
		<TextFieldPrimitive.Root class={cx(styles.root, local.class)} {...others} />
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
			class={cx(styles.input, local.class)}
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
			class={cx(styles.textarea, local.class)}
			{...others}
		/>
	);
};

type TextFieldLabelProps<T extends ValidComponent = "label"> =
	TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined };

const TextFieldLabel = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) => {
	const [local, others] = splitProps(props as TextFieldLabelProps, ["class"]);
	return (
		<TextFieldPrimitive.Label
			class={cx(styles.label, local.class)}
			{...others}
		/>
	);
};

export { TextField, TextFieldInput, TextFieldTextArea, TextFieldLabel };
