import { Ref } from "react";
import { t } from "@/lib/i18n";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./SearchBar.module.css";

type InputProps = Pick<
  React.HTMLProps<HTMLInputElement>,
  "defaultValue" | "name"
>;

function SearchBar({ id, ref, ...inputProps }: Props & InputProps) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={id}>
        <IconFactory icon="search" role="presentation" />
        <span className="sr-only">{t("search.label")}</span>
      </label>
      <input
        id={id}
        type="search"
        className={styles.input}
        placeholder={t("search.placeholder")}
        ref={ref}
        {...inputProps}
      />
      <button className={styles.button} type="submit">
        <IconFactory icon="arrowRight" role="presentation" />
        <span className="sr-only">{t("search.submit")}</span>
      </button>
    </div>
  );
}

export default SearchBar;

interface Props {
  id: string;
  ref?: Ref<HTMLInputElement>;
}
