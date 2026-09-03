import Button from "@/components/atomic/Button";
import styles from "./ErrorBlock.module.css";

// Prop-only (no i18n import): renders inside client islands (AssetInlinePDF),
// so heading/message must arrive already translated.
interface Props {
  heading: string;
  /** The error message */
  message?: string;
  reset?: () => void;
}

export default function ErrorMessage({ heading, message, reset }: Props) {
  return (
    <div className={styles.wrapper}>
      <p className="t-h3">{heading}</p>
      <p className="a-color-light">{message}</p>
      {reset && (
        <Button onClick={reset} size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}
