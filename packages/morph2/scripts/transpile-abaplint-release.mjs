import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const latestReleaseApi = "https://api.github.com/repos/oisee/abapiti/releases/latest";
const assetNameByPlatform = {
  "darwin:arm64": "abapiti-darwin-arm64",
  "darwin:x64": "abapiti-darwin-amd64",
  "linux:arm64": "abapiti-linux-arm64",
  "linux:x64": "abapiti-linux-amd64",
  "win32:arm64": "abapiti-windows-arm64.exe",
  "win32:x64": "abapiti-windows-amd64.exe",
};
const knownSha256ByRelease = {
  "v0.1.1": {
    "abapiti-darwin-arm64": "36a140f8c3f8e9ea506a09b5fe28c43af10dd37475d47f22f0926a15cca52e3f",
    "abapiti-darwin-amd64": "c844211dc3508f8e9e51cc935117e5cb31e4501819b6465e88f401ba4959a467",
    "abapiti-linux-arm64": "1b90aac1744794bd90a754c0485115a48b71733ecb9fd14b83a1ae4274aceda5",
    "abapiti-linux-amd64": "e6267cd8e2d3c714d53eee1aa492b03e7f1e98c65c9bfcfcfb751016528a225f",
    "abapiti-windows-arm64.exe": "1ac2c2d1fd60ec7decfe9a25ca759e321c37c665ee66522acd5ad1d41ae51e1b",
    "abapiti-windows-amd64.exe": "99a31730adb8d027abebb9275221604e4790fc2a8c570b863f45c5ac692f3189",
  },
};
const assetName = assetNameByPlatform[`${process.platform}:${process.arch}`];
if (!assetName) {
  throw new Error(`ABAPiti has no binary for ${process.platform}/${process.arch}`);
}

const cacheBase = path.join(packageRoot, ".cache", "abapiti-release");
const finalOutput = path.join(packageRoot, "output");
const outputManifestName = "abaplint-release-manifest.json";

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`${command} ${args.join(" ")} failed (${result.status})${detail ? `:\n${detail}` : ""}`);
  }
  return result;
}

async function resolveLatestRelease() {
  const response = await fetch(latestReleaseApi, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "abaplint-morph2",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`Fetching the latest ABAPiti release failed (${response.status} ${response.statusText})`);
  }

  const release = await response.json();
  if (typeof release.tag_name !== "string" || !/^[A-Za-z0-9._-]+$/.test(release.tag_name)) {
    throw new Error("GitHub returned an invalid tag for the latest ABAPiti release");
  }
  if (release.draft || release.prerelease) {
    throw new Error(`GitHub returned ${release.tag_name}, which is not a stable published release`);
  }
  if (!Array.isArray(release.assets)) {
    throw new Error(`GitHub returned no asset list for ABAPiti ${release.tag_name}`);
  }

  const asset = release.assets.find(candidate => candidate.name === assetName);
  if (!asset) {
    const available = (release.assets || []).map(candidate => candidate.name).join(", ") || "none";
    throw new Error(`ABAPiti ${release.tag_name} has no ${assetName} asset (available: ${available})`);
  }
  if (typeof asset.browser_download_url !== "string") {
    throw new Error(`ABAPiti ${release.tag_name} has no download URL for ${assetName}`);
  }
  let downloadUrl;
  try {
    downloadUrl = new URL(asset.browser_download_url);
  } catch {
    throw new Error(`ABAPiti ${release.tag_name} returned an invalid asset URL`);
  }
  if (downloadUrl.protocol !== "https:" || downloadUrl.hostname !== "github.com" ||
      !downloadUrl.pathname.startsWith("/oisee/abapiti/releases/download/")) {
    throw new Error(`ABAPiti ${release.tag_name} returned an unexpected asset URL`);
  }

  let expectedSha256;
  if (asset.digest != null) {
    const match = /^sha256:([a-f0-9]{64})$/i.exec(asset.digest);
    if (!match) {
      throw new Error(`ABAPiti ${release.tag_name} has an unsupported digest for ${assetName}: ${asset.digest}`);
    }
    expectedSha256 = match[1].toLowerCase();
  }
  expectedSha256 ??= knownSha256ByRelease[release.tag_name]?.[assetName];

  return {release, asset, expectedSha256};
}

async function ensureBinary(release, asset, expectedSha256, cacheRoot) {
  const binaryPath = path.join(cacheRoot, assetName);
  mkdirSync(cacheRoot, {recursive: true});
  if (existsSync(binaryPath)) {
    const cachedSha256 = sha256(readFileSync(binaryPath));
    if (expectedSha256 === undefined || cachedSha256 === expectedSha256) {
      return {binaryPath, sha256: cachedSha256};
    }
  }

  rmSync(binaryPath, {force: true});
  const response = await fetch(asset.browser_download_url, {
    headers: {"user-agent": "abaplint-morph2"},
  });
  if (!response.ok) {
    throw new Error(`Downloading ${asset.browser_download_url} failed (${response.status} ${response.statusText})`);
  }
  const contents = Buffer.from(await response.arrayBuffer());
  const actualSha256 = sha256(contents);
  if (Number.isInteger(asset.size) && contents.length !== asset.size) {
    throw new Error(`Size mismatch for ${assetName}: expected ${asset.size} bytes, got ${contents.length}`);
  }
  if (expectedSha256 !== undefined && actualSha256 !== expectedSha256) {
    throw new Error(`SHA-256 mismatch for ${assetName}: expected ${expectedSha256}, got ${actualSha256}`);
  }
  if (expectedSha256 === undefined) {
    console.warn(`ABAPiti ${release.tag_name} does not publish a SHA-256 digest for ${assetName}; downloaded over HTTPS.`);
  }

  writeFileSync(binaryPath, contents);
  if (process.platform !== "win32") {
    chmodSync(binaryPath, 0o755);
  }
  return {binaryPath, sha256: actualSha256};
}

function validateOutput(generatedRoot, release) {
  for (const folder of ["a4h", "classes", "native", "osg"]) {
    if (!existsSync(path.join(generatedRoot, folder))) {
      throw new Error(`ABAPiti ${release.tag_name} did not produce the expected ${folder} output under ${generatedRoot}`);
    }
  }
}

function publishOutput() {
  const existingManifest = path.join(finalOutput, outputManifestName);
  if (existsSync(finalOutput) && !existsSync(existingManifest)) {
    throw new Error(`Refusing to replace ${finalOutput}: it is not marked as generated by this script.`);
  }
  rmSync(finalOutput, {recursive: true, force: true});
  renameSync(generatedRoot, finalOutput);
}

const existingManifest = path.join(finalOutput, outputManifestName);
if (existsSync(finalOutput) && !existsSync(existingManifest)) {
  throw new Error(`Refusing to replace ${finalOutput}: it is not marked as generated by this script.`);
}

const {release, asset, expectedSha256} = await resolveLatestRelease();
const cacheRoot = path.join(cacheBase, release.tag_name);
const binary = await ensureBinary(release, asset, expectedSha256, cacheRoot);
const generatedRoot = path.join(cacheRoot, "generated-output");

rmSync(generatedRoot, {recursive: true, force: true});
const result = run(binary.binaryPath, ["abaplint", "-o", generatedRoot]);
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
validateOutput(generatedRoot, release);

writeFileSync(path.join(generatedRoot, outputManifestName), `${JSON.stringify({
  generatedBy: "packages/morph2/scripts/transpile-abaplint-release.mjs",
  abapitiRelease: release.tag_name,
  abapitiAsset: assetName,
  abapitiBinarySha256: binary.sha256,
  abapitiReleaseAssetSha256: expectedSha256 ?? null,
  abapitiReleaseUrl: release.html_url,
  source: "abaplint bundle included in the ABAPiti release",
}, null, 2)}\n`);
publishOutput();
console.log(`Generated the bundled abaplint output with ABAPiti ${release.tag_name} under ${path.relative(packageRoot, finalOutput)}.`);
