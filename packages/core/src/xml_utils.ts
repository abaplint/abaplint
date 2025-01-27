export function xmlToArray(data: any): any[] {
  if (data === undefined) {
    return [];
  } else if (Array.isArray(data)) {
    return data;
  } else {
    return [data];
  }
}

export function unescape(str: string | undefined): string {
  if (str === undefined) {
    return "";
  }
  str = str.replace(/&amp;/g, "&");
  str = str.replace(/&gt;/g, ">");
  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&quot;/g, "\"");
  str = str.replace(/&apos;/g, "'");
  return str;
}