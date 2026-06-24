import * as ButtonPrimitive from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import { cx } from "~/client/utils";
import styles from "./button.module.css";

const variantClass = {
  default: styles.variantDefault,
  destructive: styles.variantDestructive,
  outline: styles.variantOutline,
  secondary: styles.variantSecondary,
  ghost: styles.variantGhost,
  link: styles.variantLink,
  destructiveGhost: styles.variantDestructiveGhost,
} as const;

const sizeClass = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  icon: styles.sizeIcon,
} as const;

type ButtonVariant = keyof typeof variantClass;
type ButtonSize = keyof typeof sizeClass;

function buttonClasses(
  variant: ButtonVariant = "default",
  size: ButtonSize = "default",
  extra?: string,
) {
  return cx(styles.base, variantClass[variant], sizeClass[size], extra);
}

type ButtonProps<T extends ValidComponent = "button"> =
  ButtonPrimitive.ButtonRootProps<T> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string | undefined;
    children?: JSX.Element;
  };

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>,
) => {
  const [local, others] = splitProps(props as ButtonProps, [
    "variant",
    "size",
    "class",
  ]);
  return (
    <ButtonPrimitive.Root
      class={buttonClasses(local.variant, local.size, local.class)}
      {...others}
    />
  );
};

export type { ButtonProps, ButtonSize, ButtonVariant };
export { Button };
