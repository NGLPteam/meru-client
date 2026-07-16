import * as React from "react";
import { PropsWithChildren } from "react";
import Markdown from "../BaseMarkdown";

type MarkdownProps = React.ComponentProps<typeof Markdown> & {
  className?: string;
};

const Header = ({ children, ...props }: PropsWithChildren) => (
  <p style={{ fontWeight: "500" }} {...props}>
    {children}
  </p>
);

export default function SummaryMarkdown({
  children,
  className,
  ...props
}: MarkdownProps) {
  return (
    <Markdown
      className={`t-rte ${className || ""}`}
      components={{
        h1: Header,
        h2: Header,
        h3: Header,
        h4: Header,
        h5: Header,
        h6: Header,
      }}
      {...props}
    >
      {children}
    </Markdown>
  );
}
