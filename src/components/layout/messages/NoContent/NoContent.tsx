import classNames from "classnames";
import styles from "./NoContent.module.css";

// Prop-only (no i18n import): this renders inside client islands
// (AssetInlinePDF), so the message must arrive already translated —
// from Astro.locals.t, the server t, or an island's label props.
const NoContent = ({ message, inline }: Props) => {
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles["wrapper--inline"]]: inline,
      })}
    >
      {message && typeof message !== "string" ? (
        message
      ) : (
        <p className="t-h4">{message}</p>
      )}
    </div>
  );
};

interface Props {
  /** The (already translated) message */
  message: string | React.ReactNode;
  inline?: boolean;
}

export default NoContent;
