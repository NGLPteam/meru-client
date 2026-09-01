"use client";

// Centralized link component — Astro SSR implementation.
//
// Renders a plain anchor. Astro serves every route server-side, so a normal
// <a href> is a full, correct navigation; `replace` maps to location.replace via
// an onClick. `scroll={false}` renders a `data-keep-scroll` marker: ClientRouter
// scrolls to top on every soft navigation, and the KeepScroll script
// (src/components/client/KeepScroll.astro) restores the position after the swap
// for navigations triggered from a marked anchor — e.g. the entity tab nav,
// where bouncing to the top on each tab change loses the reader's place.
// Next-only `prefetch`/`as` are accepted for source compatibility and ignored.
// Application code must import the link component from here, never from
// "next/link" directly.
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href?: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  as?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  // prefetch/as are Next-only and intentionally dropped (rest siblings).
  { href, replace, scroll, prefetch, as, onClick, children, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      {...(scroll === false ? { "data-keep-scroll": "" } : {})}
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
