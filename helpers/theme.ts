export const stripUnit = (unit: number) => {
  // eslint-disable-next-line no-useless-escape
  return parseInt(unit.toString().replace(/[^\d\.]/g, ""));
};
export function pxToRem(px: number, base = 16) {
  return stripUnit(px) / base + "rem";
}
