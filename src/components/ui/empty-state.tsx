import { type Component, type JSX, Show } from "solid-js";
import { cx } from "~/lib/utils";
import styles from "./empty-state.module.css";

type EmptyStateProps = {
	icon?: JSX.Element;
	message: string;
	class?: string;
};

export const EmptyState: Component<EmptyStateProps> = (props) => (
	<div class={cx(styles.root, props.class)}>
		<Show when={props.icon !== undefined}>
			<div class={styles.iconWrapper}>{props.icon}</div>
		</Show>
		<p class={styles.message}>{props.message}</p>
	</div>
);
