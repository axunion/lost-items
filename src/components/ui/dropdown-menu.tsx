import * as DropdownMenuPrimitive from "@kobalte/core/dropdown-menu";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "~/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

type DropdownMenuTriggerProps<T extends ValidComponent = "button"> =
	DropdownMenuPrimitive.DropdownMenuTriggerProps<T> & {
		class?: string | undefined;
	};

const DropdownMenuTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, DropdownMenuTriggerProps<T>>,
) => {
	const [local, rest] = splitProps(props as DropdownMenuTriggerProps, [
		"class",
	]);
	return <DropdownMenuPrimitive.Trigger class={cn(local.class)} {...rest} />;
};

type DropdownMenuContentProps<T extends ValidComponent = "div"> =
	DropdownMenuPrimitive.DropdownMenuContentProps<T> & {
		class?: string | undefined;
		children?: JSX.Element;
	};

const DropdownMenuContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuContentProps<T>>,
) => {
	const [local, rest] = splitProps(props as DropdownMenuContentProps, [
		"class",
	]);
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				class={cn(
					"z-50 min-w-[180px] overflow-hidden rounded-lg border border-border/20 bg-background p-1 shadow-lg data-expanded:animate-in data-closed:animate-out data-closed:fade-out-0 data-expanded:fade-in-0 data-closed:zoom-out-95 data-expanded:zoom-in-95",
					local.class,
				)}
				{...rest}
			/>
		</DropdownMenuPrimitive.Portal>
	);
};

type DropdownMenuItemProps<T extends ValidComponent = "div"> =
	DropdownMenuPrimitive.DropdownMenuItemProps<T> & {
		class?: string | undefined;
	};

const DropdownMenuItem = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DropdownMenuItemProps<T>>,
) => {
	const [local, rest] = splitProps(props as DropdownMenuItemProps, ["class"]);
	return (
		<DropdownMenuPrimitive.Item
			class={cn(
				"relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2.5 text-sm outline-none transition-colors data-highlighted:bg-secondary data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
				local.class,
			)}
			{...rest}
		/>
	);
};

const DropdownMenuSeparator: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DropdownMenuPrimitive.Separator
			class={cn("-mx-1 my-1 border-t border-border", local.class)}
			{...rest}
		/>
	);
};

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

type DropdownMenuGroupLabelProps<T extends ValidComponent = "span"> =
	DropdownMenuPrimitive.DropdownMenuGroupLabelProps<T> & {
		class?: string | undefined;
	};

const DropdownMenuGroupLabel = <T extends ValidComponent = "span">(
	props: PolymorphicProps<T, DropdownMenuGroupLabelProps<T>>,
) => {
	const [local, rest] = splitProps(props as DropdownMenuGroupLabelProps, [
		"class",
	]);
	return (
		<DropdownMenuPrimitive.GroupLabel
			class={cn(
				"px-3 py-1.5 text-xs font-semibold text-muted-foreground",
				local.class,
			)}
			{...rest}
		/>
	);
};

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
};
