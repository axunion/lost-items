import type { Component, JSX } from "solid-js";
import { cx } from "~/client/utils";
import styles from "./section-header.module.css";

type SectionHeaderProps = {
  icon: JSX.Element;
  children: JSX.Element;
  class?: string;
};

export const SectionHeader: Component<SectionHeaderProps> = (props) => (
  <div class={cx(styles.root, props.class)}>
    <span class={styles.icon}>{props.icon}</span>
    {props.children}
  </div>
);
