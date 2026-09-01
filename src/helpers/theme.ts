const stripUnit = (unit: number) => {
  return parseInt(unit.toString().replace(/[^\d\.]/g, ""));
};
export function pxToRem(px: number, base = 16) {
  return stripUnit(px) / base + "rem";
}
