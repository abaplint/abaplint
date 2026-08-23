export function xmlToArray(data: any): any[] {
  if (data === undefined) {
    return [];
  } else if (Array.isArray(data)) {
    return data;
  } else {
    return [data];
  }
}

export function unescape(str: unknown): string {
  if (typeof str !== "string") {
    return "";
  }
  let result = str.replace(/&amp;/g, "&");
  result = result.replace(/&gt;/g, ">");
  result = result.replace(/&lt;/g, "<");
  result = result.replace(/&quot;/g, "\"");
  result = result.replace(/&apos;/g, "'");
  return result;
}
