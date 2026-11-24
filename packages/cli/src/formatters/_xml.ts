/** js2xml only escapes the quotes in attribute values, not the rest */
export function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
