import type { Component, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "~/lib/utils";

const Card: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm shadow-black/[0.03]",
				local.class,
			)}
			{...others}
		/>
	);
};

const CardHeader: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<div class={cn("flex flex-col space-y-1.5 p-6", local.class)} {...others} />
	);
};

const CardTitle: Component<ComponentProps<"h3">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<h3
			class={cn(
				"text-lg font-semibold leading-none tracking-tight",
				local.class,
			)}
			{...others}
		/>
	);
};

const CardContent: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return <div class={cn("p-6 pt-0", local.class)} {...others} />;
};

export { Card, CardHeader, CardTitle, CardContent };
