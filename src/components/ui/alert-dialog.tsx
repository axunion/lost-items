import * as AlertDialogPrimitive from "@kobalte/core/alert-dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { X } from "lucide-solid";
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const AlertDialog = AlertDialogPrimitive.Root;

type AlertDialogTriggerProps<T extends ValidComponent = "button"> =
	AlertDialogPrimitive.AlertDialogTriggerProps<T> & {
		class?: string | undefined;
	};

const AlertDialogTrigger = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, AlertDialogTriggerProps<T>>,
) => {
	const [local, rest] = splitProps(props as AlertDialogTriggerProps, ["class"]);
	return <AlertDialogPrimitive.Trigger class={cn(local.class)} {...rest} />;
};

const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps<T extends ValidComponent = "div"> =
	AlertDialogPrimitive.AlertDialogOverlayProps<T> & {
		class?: string | undefined;
	};

const AlertDialogOverlay = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, AlertDialogOverlayProps<T>>,
) => {
	const [local, others] = splitProps(props as AlertDialogOverlayProps, [
		"class",
	]);
	return (
		<AlertDialogPrimitive.Overlay
			class={cn(
				"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-expanded:animate-in data-closed:animate-out data-closed:fade-out-0 data-expanded:fade-in-0",
				local.class,
			)}
			{...others}
		/>
	);
};

type AlertDialogContentProps<T extends ValidComponent = "div"> =
	AlertDialogPrimitive.AlertDialogContentProps<T> & {
		class?: string | undefined;
		children?: JSX.Element;
	};

const AlertDialogContent = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, AlertDialogContentProps<T>>,
) => {
	const [local, others] = splitProps(props as AlertDialogContentProps, [
		"class",
		"children",
	]);
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<AlertDialogPrimitive.Content
				class={cn(
					"fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border/50 bg-background p-6 shadow-lg duration-200 data-expanded:animate-in data-closed:animate-out data-closed:fade-out-0 data-expanded:fade-in-0 data-closed:zoom-out-95 data-expanded:zoom-in-95 data-closed:slide-out-to-left-1/2 data-closed:slide-out-to-top-[48%] data-expanded:slide-in-from-left-1/2 data-expanded:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
					local.class,
				)}
				{...others}
			>
				{local.children}
				<AlertDialogPrimitive.CloseButton class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring/30 focus:ring-offset-2 disabled:pointer-events-none data-expanded:bg-accent data-expanded:text-muted-foreground">
					<X class="size-4" />
					<span class="sr-only">Close</span>
				</AlertDialogPrimitive.CloseButton>
			</AlertDialogPrimitive.Content>
		</AlertDialogPortal>
	);
};

type AlertDialogTitleProps<T extends ValidComponent = "h2"> =
	AlertDialogPrimitive.AlertDialogTitleProps<T> & {
		class?: string | undefined;
	};

const AlertDialogTitle = <T extends ValidComponent = "h2">(
	props: PolymorphicProps<T, AlertDialogTitleProps<T>>,
) => {
	const [local, others] = splitProps(props as AlertDialogTitleProps, ["class"]);
	return (
		<AlertDialogPrimitive.Title
			class={cn("text-lg font-semibold", local.class)}
			{...others}
		/>
	);
};

type AlertDialogDescriptionProps<T extends ValidComponent = "p"> =
	AlertDialogPrimitive.AlertDialogDescriptionProps<T> & {
		class?: string | undefined;
	};

const AlertDialogDescription = <T extends ValidComponent = "p">(
	props: PolymorphicProps<T, AlertDialogDescriptionProps<T>>,
) => {
	const [local, others] = splitProps(props as AlertDialogDescriptionProps, [
		"class",
	]);
	return (
		<AlertDialogPrimitive.Description
			class={cn("text-sm text-muted-foreground", local.class)}
			{...others}
		/>
	);
};

const AlertDialogHeader: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"flex flex-col space-y-2 text-center sm:text-left",
				local.class,
			)}
			{...rest}
		/>
	);
};

const AlertDialogFooter: Component<ComponentProps<"div">> = (props) => {
	const [local, rest] = splitProps(props, ["class"]);
	return (
		<div
			class={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				local.class,
			)}
			{...rest}
		/>
	);
};

type AlertDialogActionProps<T extends ValidComponent = "button"> =
	AlertDialogPrimitive.AlertDialogCloseButtonProps<T> &
		VariantProps<typeof buttonVariants> & {
			class?: string | undefined;
		};

const AlertDialogAction = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, AlertDialogActionProps<T>>,
) => {
	const [local, rest] = splitProps(props as AlertDialogActionProps, [
		"class",
		"variant",
		"size",
	]);
	return (
		<AlertDialogPrimitive.CloseButton
			class={cn(
				buttonVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			{...rest}
		/>
	);
};

type AlertDialogCancelProps<T extends ValidComponent = "button"> =
	AlertDialogPrimitive.AlertDialogCloseButtonProps<T> & {
		class?: string | undefined;
	};

const AlertDialogCancel = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, AlertDialogCancelProps<T>>,
) => {
	const [local, rest] = splitProps(props as AlertDialogCancelProps, ["class"]);
	return (
		<AlertDialogPrimitive.CloseButton
			class={cn(
				buttonVariants({ variant: "outline" }),
				"mt-2 sm:mt-0",
				local.class,
			)}
			{...rest}
		/>
	);
};

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
};
