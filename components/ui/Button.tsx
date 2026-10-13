/**
 * Button.
 *
 * Renders a <button>, an internal <Link> or an external <a> from the same
 * visual language, so a link that looks like a button is genuinely a link
 * (keyboard, middle-click, screen-reader semantics all behave correctly).
 */

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ui.module.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "small" | "medium" | "large";

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

const sizeClass: Record<Size, string | undefined> = {
  small: styles.small,
  medium: undefined,
  large: styles.large,
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  /** Renders an <a> that opens in a new tab, with the safety attributes set. */
  external?: boolean;
  /** Accessible label, when the visible text alone is ambiguous. */
  ariaLabel?: string;
};

type ButtonAsLinkProps = CommonProps & {
  href: string;
};

type ButtonAsButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

function classesFor({ variant = "primary", size = "medium", block, className }: CommonProps) {
  return [styles.button, variantClass[variant], sizeClass[size], block ? styles.block : "", className]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const { children, ariaLabel } = props;
  const className = classesFor(props);

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a
          className={className}
          href={props.href}
          aria-label={ariaLabel}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link className={className} href={props.href} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  const { type = "button", disabled, onClick } = props;

  return (
    <button
      className={className}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
