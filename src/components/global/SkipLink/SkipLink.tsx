import Alert from "@/components/atomic/Alert";
import styles from "./SkipLink.module.css";

// Prop-only (no i18n import): renders inside client islands
// (AssetInlinePDFNav), so the label must arrive already translated.
interface Props {
  toId: string;
  label: string;
}

export default function SkipLink({ toId, label }: Props) {
  const href = `#${toId}`;

  return (
    <a className={styles.link} href={href}>
      <Alert message={label} color="blue" badge />
    </a>
  );
}
