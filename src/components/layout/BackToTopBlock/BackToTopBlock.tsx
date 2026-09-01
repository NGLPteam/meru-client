import classNames from "classnames";
import { BackToTopButton } from "@/components/atomic";
import styles from "./BackToTopBlock.module.css";

/**
 * A block of content with a contained back to top button. Static markup only;
 * the <back-to-top-block> custom element (src/components/client/BackToTopBlock.astro) toggles the
 * button's visibility against the viewport and wires the scroll-to-top click.
 */
export default function BackToTopBlock({ className, children }: Props) {
  return (
    <back-to-top-block className={classNames(styles.section, className)}>
      <div className={styles.children} data-back-to-top-content>
        {children}
      </div>
      <div className={styles.button} data-back-to-top-wrapper hidden>
        <BackToTopButton data-back-to-top-button />
      </div>
    </back-to-top-block>
  );
}

interface Props {
  className?: string;
  children: React.ReactNode;
}
