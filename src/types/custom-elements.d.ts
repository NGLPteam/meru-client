// JSX typings for the custom elements defined in
// src/components/client/, so static React components can
// emit the tags under tsc --strict.
import "react";

type CustomElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  [dataAttr: `data-${string}`]: string | boolean | undefined;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "table-of-contents": CustomElementProps;
      "back-to-top-block": CustomElementProps;
      "copy-link": CustomElementProps;
      "disclosure-menu": CustomElementProps;
    }
  }
}
