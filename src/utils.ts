export function isCapitalized(input: string): boolean {
  return input[0].toLowerCase() != input[0];
}

export function capitalize(input: string): string {
  return input[0].toUpperCase() + input.slice(1).toLowerCase();
}
