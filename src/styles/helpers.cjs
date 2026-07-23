const {
  fluidScalePxBase,
  fluidScaleRemBase,
} = require("@castiron/style-mixins");

const pxPerRem = 16;

const minSpacing = "24px";

function fluidScalePx(max, min, maxVw = "1400px", minVw = "375px") {
  if (max === min) return `${max}`;
  return fluidScalePxBase(max, min, maxVw, minVw);
}

function fluidScaleRem(
  maxPx,
  minPx,
  maxVwRem = "87.5rem",
  minVwRem = "23.4375rem",
) {
  return fluidScaleRemBase(maxPx, minPx, maxVwRem, minVwRem, pxPerRem);
}

// Palette lives in colors.json so the browser bundle (Vite) can import it as
// ESM too — Vite serves this .cjs raw (top-level require + module.exports), so
// client code can't import from here directly.
const colors = require("./colors.json");

module.exports = {
  pxPerRem,
  fluidScalePx,
  fluidScaleRem,
  minSpacing,
  colors,
};
