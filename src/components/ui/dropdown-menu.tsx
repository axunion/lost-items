import * as DropdownMenuPrimitive from "@kobalte/core/dropdown-menu";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "~/lib/utils";
import styles from "./dropdown-menu.module.css";

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
	return <DropdownMenuPrimitive.Trigger class={local.class} {...rest} />;
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
				class={cx(styles.content, local.class)}
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
			class={cx(styles.item, local.class)}
			{...rest}
		/>
	);
};

const DropdownMenuSeparator: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<DropdownMenuPrimitive.Separator
			class={cx(styles.separator, local.class)}
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
			class={cx(styles.groupLabel, local.class)}
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
