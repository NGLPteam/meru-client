import classNames from "classnames";
import styles from "./StatBlock.module.css";

type Props = {
  stat: string | number;
  /** Already-translated label */
  label: string;
  headingLevel?: 1 | 3;
};

export default function StatBlock({ stat, label, headingLevel = 1 }: Props) {
  return (
    <div className={styles.outer}>
      <span className={styles.label}>{label}</span>
      <span
        className={classNames(styles.stat, {
          [styles["stat--lg"]]: headingLevel === 1,
          [styles["stat--sm"]]: headingLevel === 3,
        })}
      >
        {stat}
      </span>
    </div>
  );
}
