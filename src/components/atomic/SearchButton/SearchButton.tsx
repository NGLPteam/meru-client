import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { pxToRem } from "@/helpers/theme";
import SearchModal, {
  type SearchModalHandle,
} from "@/components/layout/SearchModal";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./SearchButton.module.css";

export default function SearchButton({ data, size = "sm" }: Props) {
  const { t } = useTranslation();
  const imageSize = size === "sm" ? 32 : 72;
  const style = {
    "--search-button-size": `${pxToRem(imageSize)}`,
  } as React.CSSProperties;
  const modalRef = useRef<SearchModalHandle>(null);
  const searchData = useFragment(fragment, data);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        style={style}
        aria-haspopup="dialog"
        onClick={() => modalRef.current?.open()}
      >
        <IconFactory
          icon={size === "sm" ? "search" : "search32"}
          role="presentation"
        />
        <span className="sr-only">{t("search.label")}</span>
      </button>
      <SearchModal ref={modalRef} data={searchData} />
    </>
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  size?: "sm" | "lg";
}

export const fragment = graphql(`
  fragment SearchButtonFragment on Entity {
    ...SearchModalFragment
  }
`);
