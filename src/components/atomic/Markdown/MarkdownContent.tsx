// react-markdown needs its markdown source as a STRING child; Astro passes
// slot children to React as pre-rendered HTML, so .astro callers must use this
// prop-based wrapper instead of <Markdown.*> with children.
import Markdown from "./index";

const VARIANTS = {
  base: Markdown.Base,
  title: Markdown.Title,
  summary: Markdown.Summary,
} as const;

export default function MarkdownContent({
  content,
  variant = "base",
  className,
}: {
  content: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const Component = VARIANTS[variant];
  return <Component className={className}>{content}</Component>;
}
