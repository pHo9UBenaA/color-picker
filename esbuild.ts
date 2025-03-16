/// <reference lib="deno.ns" />

import { copy, ensureDir } from "jsr:@std/fs";
import { build, stop } from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

const SRC_DIR = "./src";
const DIST_DIR = "./dist";
const ASSETS_DIR = `${SRC_DIR}/assets`;

const shouldMinify = Deno.args.includes("--minify");

const initializeDist = async () => await ensureDir(DIST_DIR);

const copyAssets = async () => {
  for await (const entry of Deno.readDir(ASSETS_DIR)) {
    const srcPath = `${ASSETS_DIR}/${entry.name}`;
    const destPath = `${DIST_DIR}/${entry.name}`;
    if (entry.isFile) {
      await Deno.copyFile(srcPath, destPath);
    } else if (entry.isDirectory) {
      await copy(srcPath, destPath);
    }
  }
};

const bundleWithEsbuild = async () => {
  // Define entry points for background and content scripts
  const entryPoints = [
    `${SRC_DIR}/background.ts`,
    `${SRC_DIR}/content.ts`,
  ];
  
  // Build each entry point
  const result = await build({
    entryPoints,
    outdir: DIST_DIR,
    bundle: true,
    minify: shouldMinify,
    platform: "browser",
    target: ["esnext"],
    plugins: [...denoPlugins()],
  });

  stop();
  if (result.errors.length > 0) {
    throw new Error(`Build failed with errors: ${result.errors}`);
  }
  console.info("Build completed with esbuild.");
};

const main = async () => {
  await initializeDist();
  await copyAssets();
  await bundleWithEsbuild();
};

main().catch((err) => console.error("Build failed:", err.message));
