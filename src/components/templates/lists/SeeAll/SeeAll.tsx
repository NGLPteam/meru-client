import classNames from "classnames";
import { useTranslation } from "react-i18next";
import Button from "@/components/atomic/Button";
import NamedLink from "@/components/atomic/links/NamedLink";
import styles from "./SeeAll.module.css";

export type SeeAllProps = {
  buttonLabel?: string | null;
  href: string;
  alignment: "center" | "left";
  className?: string;
  icon?: React.ComponentProps<typeof Button>["icon"];
  size?: "sm" | "lg";
};

export default function SeeAll(props: SeeAllProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classNames("see-all-button", props.className, styles.seeAll, {
        [styles["seeAll--left"]]: props.alignment === "left",
      })}
    >
      <NamedLink href={props.href}>
        <Button as="div" icon={props.icon} size={props.size}>
          <span className="t-capitalize">
            {props.buttonLabel ?? t("nav.see_all")}
          </span>
        </Button>
      </NamedLink>
    </div>
  );
}
