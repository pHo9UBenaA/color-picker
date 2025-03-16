/// <reference types="@types/chrome" />
/// <reference path="./my-global.d.ts" />

import { ColorFormat } from "./types.ts";

// Color conversion utilities
const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

const rgbaToString = (r: number, g: number, b: number, a: number): string =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

const hslToString = (h: number, s: number, l: number): string =>
  `hsl(${h}, ${s}%, ${l}%)`;

const hslaToString = (h: number, s: number, l: number, a: number): string =>
  `hsla(${h}, ${s}%, ${l}%, ${a})`;

// Convert color based on format
const formatColor = (sRGBHex: string, format: ColorFormat): string => {
  const r = parseInt(sRGBHex.slice(1, 3), 16);
  const g = parseInt(sRGBHex.slice(3, 5), 16);
  const b = parseInt(sRGBHex.slice(5, 7), 16);

  switch (format) {
    case "hex":
      return sRGBHex;
    case "rgb":
      return `rgb(${r}, ${g}, ${b})`;
    case "rgba":
      return rgbaToString(r, g, b, 1);
    case "hsl": {
      const [h, s, l] = RGBToHSL(r, g, b);
      return hslToString(h, s, l);
    }
    case "hsla": {
      const [h, s, l] = RGBToHSL(r, g, b);
      return hslaToString(h, s, l, 1);
    }
    default:
      return sRGBHex;
  }
};

// RGB to HSL conversion
const RGBToHSL = (
  r: number,
  g: number,
  b: number,
): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Copy text to clipboard
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    alert("クリップボードへの書き込みに失敗。コピーしたいタブにフォーカスが当たっている確認すること。");
    console.error("Failed to copy text:", err);
  }
};

const getColorFormat = async (): Promise<ColorFormat> => {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "get-color-format",
    });
    return response.format;
  } catch (error) {
    console.error("Failed to get color format:", error);
    return "hex";
  }
};

// Main color picker functionality
const activateColorPicker = async (): Promise<void> => {
  if (!globalThis?.EyeDropper) {
    console.error("EyeDropper API is not available");
  }

  const format = await getColorFormat();
  const eyeDropper = new globalThis.EyeDropper();

  // Chain the operations
  eyeDropper.open()
    .then(async (result) => {
      const formattedColor = formatColor(result.sRGBHex, format);
      await copyToClipboard(formattedColor);
    })
    .catch((error) => {
      console.error("Error picking color:", error);
    });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "activate-picker") {
    activateColorPicker();
  }
  return true;
});
