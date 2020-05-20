export function isCapitalized(input: string): boolean {
  if (!input) return false;
  return input[0].toLowerCase() != input[0];
}

export function capitalize(input: string): string {
  if (!input) return input;
  return input[0].toUpperCase() + input.slice(1).toLowerCase();
}

export const GA_TRACKING_ID = "UA-167217561-1";
