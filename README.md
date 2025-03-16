# Color Picker Chrome Extension

注意: このドキュメントと拡張機能は AI アシスタント "Cline" によって生成されました。

A Chrome extension that allows you to pick colors from any webpage with a magnifying glass effect.

## Features

- **Color Picker Tool**: Activate via context menu or extension icon
- **Magnifying Glass**: See a zoomed view of the area around your cursor
- **Multiple Color Formats**: Copy colors in HEX, RGB, RGBA, HSL, or HSLA format
- **Customizable**: Choose your preferred color format in the options page

## Installation

1. Clone this repository
2. Run `deno task build` to build the extension
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the `dist` directory from this project

## Usage

1. Right-click anywhere on a webpage and select "Pick Color" from the context menu
2. Move your cursor over the area with the color you want to pick
3. The magnifying glass will show a zoomed view of the area
4. Click to copy the color to your clipboard in your preferred format

## Options

You can customize the extension by clicking on the extension icon and selecting "Options":

- **Color Format**: Choose between HEX, RGB, RGBA, HSL, or HSLA formats

## Development

This extension is built using Deno and TypeScript.

### Prerequisites

- [Deno](https://deno.land/) installed on your system

### Build Commands

- `deno task build`: Build the extension
- `deno task zip`: Build and create a zip file for distribution
- `deno task format`: Format the code
- `deno task lint`: Lint the code
- `deno task check`: Type-check the code

## License

See the [LICENSE](LICENSE) file for details.
