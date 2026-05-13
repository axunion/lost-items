import * as DialogPrimitive from "@kobalte/core/dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import { X } from "lucide-solid";
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "~/lib/utils";
import styles from "./dialog.module.css";

const Dialog = DialogPrimitive.Root;

type DialogTriggerProps<T extends ValidComponent = "button"> =
	DialogPrimitive.DialogTriggerProps<T> & {
		class?: string | undefined;
	};

const DialogTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, DialogTriggerProps<T>>,
) => {
	const [local, rest] = splitProps(props as DialogTriggerProps, ["class"]);
	return <DialogPrimitive.Trigger class={local.class} {...rest} />;
};

const DialogPortal: Component<DialogPrimitive.DialogPortalProps> = (props) => {
	const [, rest] = splitProps(props, ["children"]);
	return (
		<DialogPrimitive.Portal {...rest}>
			<div class={styles.portal}>{props.children}</div>
		</DialogPrimitive.Portal>
	);
};

type DialogOverlayProps<T extends ValidComponent = "div"> =
	DialogPrimitive.DialogOverlayProps<T> & { class?: string | undefined };

const DialogOverlay = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => {
	const [local, rest] = splitProps(props as DialogOverlayProps, ["class"]);
	return (
		<DialogPrimitive.Overlay
			class={cx(styles.overlay, local.class)}
			{...rest}
		/>
	);
};

type DialogContentProps<T extends ValidComponent = "div"> =
	DialogPrimitive.DialogContentProps<T> & {
		class?: string | undefined;
		children?: JSX.Element;
	};

const DialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, DialogContentProps<T>>,
) => {
	const [local, rest] = splitProps(props as DialogContentProps, [
		"class",
		"children",
	]);
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				class={cx(styles.content, local.class)}
				{...rest}
			>
				{local.children}
				<DialogPrimitive.CloseButton class={styles.closeButton}>
					<X class={styles.closeIcon} />
					<span class={styles.srOnly}>Close</span>
				</DialogPrimitive.CloseButton>
			</DialogPrimitive.Content>
		</DialogPortal>
	);
};

const DialogHeader: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cx(styles.header, local.class)} {...rest} />;
};

const DialogFooter: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return <div class={cx(styles.footer, local.class)} {...rest} />;
};

type DialogTitleProps<T extends ValidComponent = "h2"> =
	DialogPrimitive.DialogTitleProps<T> & {
		class?: string | undefined;
	};

const DialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, DialogTitleProps<T>>,
) => {
	const [local, rest] = splitProps(props as DialogTitleProps, ["class"]);
	return (
		<DialogPrimitive.Title class={cx(styles.title, local.class)} {...rest} />
	);
};

export {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
};
