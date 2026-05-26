import type { Component, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "~/client/utils";
import styles from "./card.module.css";

const Card: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return <div class={cx(styles.card, local.class)} {...others} />;
};

const CardHeader: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return <div class={cx(styles.header, local.class)} {...others} />;
};

const CardTitle: Component<ComponentProps<"h3">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return <h3 class={cx(styles.title, local.class)} {...others} />;
};

const CardContent: Component<ComponentProps<"div">> = (props) => {
	const [local, others] = splitProps(props, ["class"]);
	return <div class={cx(styles.content, local.class)} {...others} />;
};

export { Card, CardHeader, CardTitle, CardContent };
