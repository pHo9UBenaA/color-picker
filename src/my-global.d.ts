interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropper {
  open(): Promise<EyeDropperResult>;
}

declare global {
  namespace globalThis {
    // deno-lint-ignore no-var
    var EyeDropper: {
      new (): EyeDropper;
    };
  }
}

export {};
