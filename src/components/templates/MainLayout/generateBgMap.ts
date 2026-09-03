import type { DocumentType } from "@/lib/api/gql";
import type { HeroBackground } from "@/types/graphql-schema";
import type { mainLayoutFragment } from "./graphql";

type Template = DocumentType<typeof mainLayoutFragment>["templates"][number];
type SiblingTemplateData = NonNullable<Template["nextSiblings"]>[number];

export const generateBgMap = (
  startColor: HeroBackground,
  firstTemplate: Template,
  secondTemplate: Template,
) => {
  const firstSibling = secondTemplate?.prevSiblings?.[0];

  const { nextSiblings } = firstTemplate ?? {};

  // if 0 or 1 templates don't adjust bg colors
  if (!firstSibling || !nextSiblings?.length) return null;

  const allSiblings = [firstSibling].concat(nextSiblings);

  return allSiblings?.reduce(
    (map, sib) => mapSiblingBgs(map, sib, startColor),
    [] as (HeroBackground | "hidden")[],
  );
};

const getFirstBg = (
  startColor: HeroBackground,
  template: SiblingTemplateData,
): (HeroBackground | "hidden")[] => {
  if (template.hidden) return ["hidden" as const];
  if (template.dark) return ["DARK"];
  return [startColor];
};

const mapSiblingBgs = (
  bgMap: (HeroBackground | "hidden")[],
  template: SiblingTemplateData,
  startColor: HeroBackground,
) => {
  if (template.hidden) return [...bgMap, "hidden" as const];
  if (template.dark) {
    if (bgMap[bgMap.length - 1] !== "DARK") return [...bgMap, "DARK" as const];
  }

  if (!bgMap.length) return getFirstBg(startColor, template);

  return [...bgMap, getNextColor(bgMap)];
};

const getNextColor = (
  bgMap: (HeroBackground | "hidden")[],
): HeroBackground | "hidden" => {
  const prevColor = bgMap.pop();

  if (prevColor === "hidden") return getNextColor(bgMap);
  if (prevColor === "LIGHT") return "NONE";
  if (prevColor === "NONE") return "LIGHT";
  if (prevColor === "DARK")
    return bgMap.findLast(
      (c) => c === "LIGHT" || c === "NONE",
    ) as HeroBackground;

  return "hidden";
};
