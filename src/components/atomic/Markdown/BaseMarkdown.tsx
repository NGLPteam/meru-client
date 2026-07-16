import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ErrorBoundary } from "react-error-boundary";
import useIsMounted from "@/hooks/useIsMounted";
import { Alert } from "@/components/atomic";

export default function BaseMarkdown({
  children,
  skipMountCheck = false,
  ...props
}: Props) {
  const rehypePlugins = [rehypeRaw];

  const isMounted = useIsMounted();

  return children && (isMounted || skipMountCheck) ? (
    <ErrorBoundary
      fallbackRender={() => (
        <Alert message="Invalid markdown content" color="red" badge icon />
      )}
    >
      <ReactMarkdown rehypePlugins={rehypePlugins} {...props}>
        {children}
      </ReactMarkdown>
    </ErrorBoundary>
  ) : null;
}

type MarkdownProps = Pick<
  React.ComponentProps<typeof ReactMarkdown>,
  "allowedElements" | "components" | "disallowedElements"
>;

interface Props extends MarkdownProps {
  className?: string;
  children?: string | null;
  skipMountCheck?: boolean;
}
