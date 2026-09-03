import classNames from "classnames";
import styles from "./Switch.module.css";

type Props = {
  // Already-translated option labels — see metrics.astro.
  options: { label: string; value: string }[];
  onClick: (val: string) => void;
  active: string;
};

export default function Switch({ options, active, onClick }: Props) {
  return (
    <div className={styles.wrapper}>
      {options.map((option) => (
        <button
          key={option.value}
          className={classNames(styles.button, {
            [styles["button--active"]]: option.value === active,
          })}
          disabled={option.value === active}
          aria-disabled={option.value === active}
          tabIndex={option.value === active ? -1 : 0}
          onClick={() => onClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
