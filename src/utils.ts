export type Casing = "lower" | "upper";

export function getCasing(input: string): Casing {
  if (!input) return "lower";

  if (input[0].toLowerCase() != input[0]) return "upper";
  return "lower";
}

export function applyCasing(input: string, casing: Casing): string {
  if (!input) return input;

  switch (casing) {
    case "lower":
      return input.toLowerCase();
    case "upper":
      return input[0].toUpperCase() + input.slice(1).toLowerCase();
  }
}

export function ensureString(input: string | string[]): string {
  if (input instanceof Array) return input[0];
  return input;
}

export function ensureArray(input: string | string[]): string[] {
  if (input instanceof Array) return input;
  return [input];
}

export const GA_TRACKING_ID = "UA-167217561-1";
