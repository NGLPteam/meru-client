import { ComponentProps } from "react";
import Button from "..";
type Props = ComponentProps<typeof Button>;

// Prop-only (no i18n import): renders inside client islands (AssetInlinePDF),
// so the label arrives as children, already translated.
export default function BackToTopButton(
  props: Omit<Props, "icon" | "hideLabelOnMobile">,
) {
  return <Button secondary icon="arrowUp" hideLabelOnMobile {...props} />;
}
