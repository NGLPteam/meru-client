"use client";

// Centralized link component — Astro SSR implementation.
//
// Renders a plain anchor. Astro serves every route server-side, so a normal
// <a href> is a full, correct navigation; `replace` maps to location.replace via
// an onClick. Next-only props (`prefetch`, `scroll`, `as`) are accepted for
// source compatibility and ignored. Application code must import the link
// component from here, never from "next/link" directly.
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  as?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  // scroll/prefetch/as are Next-only and intentionally dropped (rest siblings).
  { href, replace, scroll, prefetch, as, onClick, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (replace && href && !e.defaultPrevented) {
          e.preventDefault();
          window.location.replace(href);
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
