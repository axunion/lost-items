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
		<TextField.Root class={cn("flex flex-col gap-2", local.class)} {...others}>
			{local.label && (
				<TextField.Label class="text-sm font-semibold text-slate-700">
					{local.label}
				</TextField.Label>
			)}
			<TextField.Input
				class={cn(
					"flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
				)}
			/>
			{local.error && (
				<TextField.ErrorMessage class="text-sm font-medium text-red-600">
					{local.error}
				</TextField.ErrorMessage>
			)}
		</TextField.Root>
	);
};

export { Input };
