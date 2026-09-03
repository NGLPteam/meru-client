import { ComponentProps } from "react";
import { t } from "@/lib/i18n";
import Button from "..";
import type { MaybeButtonRef } from "@castiron/common-types";

type Props = ComponentProps<typeof Button> & {
  as: "a" | "div" | "button";
  ref?: MaybeButtonRef;
};

function BackButton({ children, as = "a", ref, ...props }: Props) {
  return (
    <Button
      ref={ref}
      as={as}
      size="sm"
      secondary
      {...props}
      icon="arrowLeft"
      iconLeft
    >
      {children || t("common.back")}
    </Button>
  );
}

export default BackButton;
