import { LoaderCircle } from "lucide-solid";
import type { Component } from "solid-js";

import { cx } from "~/lib/utils";
import styles from "./loading.module.css";

type LoadingProps = {
	variant?: "default" | "fullscreen" | "inline";
	class?: string;
	size?: "sm" | "md" | "lg";
	text?: string;
};

const variantClass = {
	default: styles.variantDefault,
	fullscreen: styles.variantFullscreen,
	inline: styles.variantInline,
} as const;

const sizeClass = {
	sm: styles.sizeSm,
	md: styles.sizeMd,
	lg: styles.sizeLg,
} as const;

const textClass = {
	sm: styles.textSm,
	md: styles.textDefault,
	lg: styles.textDefault,
} as const;

export const Loading: Component<LoadingProps> = (props) => {
	const variant = () => props.variant ?? "default";
	const size = () => props.size ?? "md";

	return (
		<div class={cx(styles.wrapper, variantClass[variant()], props.class)}>
			<LoaderCircle class={cx(styles.spinner, sizeClass[size()])} />
			{props.text && <span class={textClass[size()]}>{props.text}</span>}
		</div>
	);
};
