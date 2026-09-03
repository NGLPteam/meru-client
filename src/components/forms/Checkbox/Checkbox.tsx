import { Ref } from "react";
import classNames from "classnames";
import { t } from "@/lib/i18n";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./Checkbox.module.css";

function Checkbox({ label, defaultChecked, ref, ...props }: Props) {
  return (
    <label
      className={styles.label}
      aria-label={props["aria-label"] || undefined}
    >
      <input
        className="sr-only"
        type="checkbox"
        ref={ref}
        defaultChecked={defaultChecked}
        {...props}
      />
      <IconFactory
        className={styles.icon}
        icon="checkbox"
        role="presentation"
      />
      <span className={classNames(styles["label__text"], "t-copy-sm")}>
        {t(label)}
      </span>
    </label>
  );
}

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.JSX.Element | string;
  label: string;
  ref?: Ref<HTMLInputElement>;
}

export default Checkbox;
