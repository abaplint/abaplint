import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = path.join(repoRoot, "url-check-errors.md");

const SKIP_DIRS = new Set(["node_modules", ".git", "build", "dist", ".next"]);
const SKIP_FILES = new Set(["url-check-errors.md"]);
const TEXT_EXTENSIONS = new Set([
  ".ts", ".js", ".mjs", ".json", ".md", ".adoc", ".html", ".xml", ".yml", ".yaml",
  ".css", ".scss", ".txt", ".svg", ".abap", ".cls", ".intf",
]);

const URL_REGEX = /https?:\/\/[^\s\)\]\"\'\`<>\\]+/gi;

function cleanUrl(raw) {
  let url = raw.replace(/[.,;:!?]+$/, "");
  url = url.replace(/\\+$/, "");
  url = url.replace(/&quot;.*$/i, "");
  url = url.replace(/&lt;.*$/i, "");
  url = url.replace(/%22.*$/, "");
  url = url.replace(/&amp;.*$/i, "");
  url = url.replace(/&quot;?$/i, "");
  while (url.endsWith(")") || url.endsWith("]") || url.endsWith("'") || url.endsWith('"')) {
    url = url.slice(0, -1);
  }
  return url;
}

const SKIP_URL_PATTERNS = [
  /^https?:\/\/www\.w3\.org\//,
  /^https?:\/\/www\.sap\.com\/abapxml/,
  /^https?:\/\/sodipodi\.sourceforge\.net\//,
  /^https?:\/\/www\.inkscape\.org\/namespaces\//,
  /^https?:\/\/www\.openswatchbook\.org\//,
  /^https?:\/\/purl\.org\//,
  /^https?:\/\/xmlns\./,
  /^https?:\/\/schemas\.microsoft\.com\//,
  /^https?:\/\/schemas\.openxmlformats\.org\//,
];

function shouldSkipUrl(url) {
  return SKIP_URL_PATTERNS.some((re) => re.test(url));
}

const GET_ONLY_HOSTS = [
  "marketplace.visualstudio.com",
  "www.npmjs.com",
  "npmjs.com",
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext) || entry.name.startsWith(".")) {
        files.push(full);
      }
    }
  }
  return files;
}

function extractUrls(content) {
  const matches = content.match(URL_REGEX) || [];
  return matches.map(cleanUrl).filter((u) => u.length > 10);
}

function getSapHelpTopic(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "help.sap.com" || !parsed.pathname.includes("/doc/")) {
      return "";
    }
    const fileParam = parsed.searchParams.get("file");
    if (fileParam) {
      return path.basename(fileParam).replace(/\.(htm|html)$/i, "");
    }
    return path.basename(parsed.pathname).replace(/\.(htm|html)$/i, "");
  } catch {
    return "";
  }
}

function isSapHelpSoft404(url, body) {
  if (body.length < 3500) {
    return true;
  }

  const title = (body.match(/<title[^>]*>([^<]+)/i) || [])[1]?.trim() || "";
  if (/ABAP Keyword Documentation/i.test(title) && title.length > 25) {
    return false;
  }

  const topic = getSapHelpTopic(url);
  if (!topic || topic.toLowerCase() === "index") {
    return body.length < 5000;
  }

  const variants = new Set([topic.toUpperCase()]);
  if (topic.startsWith("abap")) {
    variants.add(topic.slice(4).toUpperCase());
  }
  if (topic.startsWith("aben")) {
    variants.add(topic.slice(4).toUpperCase());
  }

  const upperBody = body.toUpperCase();
  return ![...variants].some((v) => upperBody.includes(v));
}

async function fetchUrl(url, method, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function checkUrl(url, timeoutMs = 20000) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  const sapHelpDoc = hostname === "help.sap.com" && getSapHelpTopic(url);
  const preferGet = sapHelpDoc || GET_ONLY_HOSTS.some((h) => hostname === h || hostname.endsWith("." + h));
  const methods = preferGet ? ["GET"] : ["HEAD", "GET"];

  for (const method of methods) {
    try {
      const response = await fetchUrl(url, method, timeoutMs);
      if (response.ok || (response.status >= 300 && response.status < 400)) {
        if (sapHelpDoc && method === "GET") {
          const body = await response.text();
          if (isSapHelpSoft404(url, body)) {
            return { ok: false, status: response.status, error: "SAP Help soft 404 (page not found)" };
          }
        }
        return { ok: true, status: response.status };
      }
      if (method === "HEAD" && [403, 405, 501].includes(response.status)) {
        continue;
      }
      return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    } catch (err) {
      if (method === "GET") {
        return { ok: false, error: err.name === "AbortError" ? "Timeout" : String(err.message || err) };
      }
    }
  }
  return { ok: false, error: "Request failed" };
}

async function runPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

console.log("Scanning files...");
const files = walk(repoRoot);
const urlMap = new Map();

for (const file of files) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const urls = extractUrls(content);
  const rel = path.relative(repoRoot, file).replace(/\\/g, "/");
  for (const url of urls) {
    if (shouldSkipUrl(url)) continue;
    if (!urlMap.has(url)) urlMap.set(url, new Set());
    urlMap.get(url).add(rel);
  }
}

const skippedNamespaceCount = [...new Set(
  files.flatMap((file) => {
    try {
      return extractUrls(fs.readFileSync(file, "utf8")).filter(shouldSkipUrl);
    } catch {
      return [];
    }
  }),
)].length;

const uniqueUrls = [...urlMap.keys()].sort();
console.log(`Found ${uniqueUrls.length} unique URLs in ${files.length} files`);

console.log("Checking URLs (concurrency 10)...");
const checkResults = await runPool(uniqueUrls, 10, async (url) => {
  const result = await checkUrl(url);
  process.stdout.write(result.ok ? "." : "X");
  return { url, ...result };
});
console.log("\nDone checking.");

const errors = checkResults.filter((r) => {
  if (r.ok) return false;
  try {
    const host = new URL(r.url).hostname;
    if ((host === "www.npmjs.com" || host === "npmjs.com") && r.status === 403) {
      return false;
    }
  } catch {
    // keep error
  }
  return true;
});
errors.sort((a, b) => a.url.localeCompare(b.url));

const lines = [
  "# URL Check Errors",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Scanned ${files.length} files, found ${uniqueUrls.length} unique URLs (${skippedNamespaceCount} XML/SVG namespace URIs skipped).`,
  `Working: ${checkResults.length - errors.length}, Errors: ${errors.length}`,
  "",
];

if (errors.length === 0) {
  lines.push("No broken URLs found.");
} else {
  lines.push("| File | URL | Error |");
  lines.push("| --- | --- | --- |");
  for (const err of errors) {
    const filesForUrl = [...urlMap.get(err.url)].sort();
    for (const file of filesForUrl) {
      const fileLink = `[${file}](${file})`;
      const urlLink = `[${err.url}](${err.url})`;
      const errorText = err.status ? `${err.error || err.status}` : (err.error || "Unknown error");
      lines.push(`| ${fileLink} | ${urlLink} | ${errorText.replace(/\|/g, "\\|")} |`);
    }
  }
}

fs.writeFileSync(outputFile, lines.join("\n") + "\n", "utf8");
console.log(`Report written to ${outputFile}`);
console.log(`Errors: ${errors.length}`);
