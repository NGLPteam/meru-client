import { InputHTMLAttributes } from "react";
import classNames from "classnames";
import { MaybeInputRef } from "@castiron/common-types";
import Label from "../Label";
import styles from "./Input.module.css";

function Input({
  id,
  block,
  label,
  hideLabel,
  ref,
  ...props
}: Props & Omit<InputHTMLAttributes<HTMLInputElement>, "size">) {
  return (
    <div>
      {label && (
        <Label htmlFor={id} className={hideLabel && "sr-only"}>
          {label}
        </Label>
      )}
      <div
        className={classNames(styles.wrapper, {
          [styles["wrapper--block"]]: block,
        })}
      >
        <input className={styles.input} id={id} ref={ref} {...props} />
      </div>
    </div>
  );
}

export default Input;

interface Props {
  id?: string;
  block?: true;
  label?: string;
  hideLabel?: true;
  ref?: MaybeInputRef;
}
