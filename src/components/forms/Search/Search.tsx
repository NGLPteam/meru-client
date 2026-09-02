import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { navigate } from "astro:transitions/client";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./Search.module.css";

export default function Search({
  pathname = "/search",
  placeholder,
  mobile,
  id,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  const { handleSubmit, register } = useForm();

  const submitHandler = (data: Record<string, string>) => {
    if (!pathname) return null;

    const params = new URLSearchParams({
      q: data.q,
    });

    const url = `${pathname}?${params.toString()}`;

    if (onSubmit) onSubmit();

    navigate(url);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className={classNames(styles.form)}
    >
      <label className={styles.label} htmlFor={id}>
        <span className="sr-only">{placeholder || t("search.label")}</span>
        <IconFactory icon="search" role="presentation" />
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder || t("search.label")}
        className={classNames(styles.input, { "t-copy-sm": mobile })}
        {...register("q")}
      />
      <button className={styles.submit} type="submit">
        <IconFactory icon="arrowRight" role="presentation" />
        <span className="sr-only">{t("search.submit")}</span>
      </button>
    </form>
  );
}

interface Props {
  pathname?: string;
  placeholder?: string;
  mobile?: boolean;
  id: string;
  onSubmit?: () => void;
}
