import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(readFileSync(path.join(packageRoot, "toolchain.json"), "utf8"));
const cacheRoot = path.join(packageRoot, ".cache");
const abapitiRoot = path.join(cacheRoot, "abapiti");
const generatedRoot = path.join(cacheRoot, "generated-output");
const finalOutput = path.join(packageRoot, "output");
const coreRoot = path.resolve(packageRoot, "../core");
const coreSourceRoot = path.join(coreRoot, "src");
const corePackage = JSON.parse(readFileSync(path.join(coreRoot, "package.json"), "utf8"));
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("Run this script with `npm run transpile` so it can install ABAPiti's locked dependencies.");
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? packageRoot,
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0 && !options.allowFailure) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(`${command} ${args.join(" ")} failed (${result.status})${detail ? `:\n${detail}` : ""}`);
  }
  return result;
}

function runNpm(args, cwd) {
  return run(process.execPath, [npmCli, ...args], {cwd});
}

function walkFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      found.push(fullPath);
    }
  }
  return found;
}

function ensureAbapitiCheckout() {
  mkdirSync(cacheRoot, {recursive: true});
  if (!existsSync(path.join(abapitiRoot, ".git"))) {
    mkdirSync(abapitiRoot, {recursive: true});
    run("git", ["init", "--quiet"], {cwd: abapitiRoot});
    run("git", ["remote", "add", "origin", lock.abapiti.repository], {cwd: abapitiRoot});
  }

  run("git", ["fetch", "--depth=1", "origin", lock.abapiti.branch], {cwd: abapitiRoot});
  const fetchedHead = run("git", ["rev-parse", "FETCH_HEAD"], {cwd: abapitiRoot}).stdout.trim();
  const headResult = run("git", ["rev-parse", "HEAD"], {cwd: abapitiRoot, allowFailure: true});
  const head = headResult.status === 0 ? headResult.stdout.trim() : "";
  if (head !== fetchedHead) {
    run("git", ["checkout", "--detach", "FETCH_HEAD"], {cwd: abapitiRoot});
  }

  const checkedOutHead = run("git", ["rev-parse", "HEAD"], {cwd: abapitiRoot}).stdout.trim();
  if (checkedOutHead !== fetchedHead) {
    throw new Error(`ABAPiti checkout mismatch: expected origin/${lock.abapiti.branch} at ${fetchedHead}, got ${checkedOutHead}`);
  }
  return checkedOutHead;
}

function ensureAbapitiDependencies() {
  const lockfile = path.join(abapitiRoot, "package-lock.json");
  const stampPath = path.join(cacheRoot, "abapiti-npm-lock.sha256");
  const lockHash = createHash("sha256").update(readFileSync(lockfile)).digest("hex");
  const stamp = existsSync(stampPath) ? readFileSync(stampPath, "utf8").trim() : "";
  const typescriptPath = path.join(abapitiRoot, "node_modules", "typescript", "lib", "typescript.js");
  if (stamp !== lockHash || !existsSync(typescriptPath)) {
    runNpm(["ci", "--ignore-scripts"], abapitiRoot);
    writeFileSync(stampPath, `${lockHash}\n`);
  }
}

function buildAbapiti(abapitiCommit) {
  const goVersionOutput = run("go", ["version"]).stdout.trim();
  const versionMatch = goVersionOutput.match(/\bgo(\d+)\.(\d+)(?:\.(\d+))?\b/);
  const actualVersion = versionMatch?.slice(1).map((part) => Number(part));
  const goMod = readFileSync(path.join(abapitiRoot, "go.mod"), "utf8");
  const requiredVersionMatch = goMod.match(/^go\s+(\d+\.\d+(?:\.\d+)?)/m);
  if (!requiredVersionMatch) {
    throw new Error(`Could not read the Go version requirement from ${path.join(abapitiRoot, "go.mod")}`);
  }
  const minimumGoVersion = requiredVersionMatch[1];
  const requiredVersion = minimumGoVersion.split(".").map((part) => Number(part));
  const versionComparison = actualVersion
    ? [0, 1, 2].reduce((comparison, index) => comparison || (actualVersion[index] ?? 0) - (requiredVersion[index] ?? 0), 0)
    : -1;
  if (versionComparison < 0) {
    throw new Error(`Go ${minimumGoVersion} or newer is required by ABAPiti; found: ${goVersionOutput}`);
  }
  const goVersion = versionMatch[0].slice(2);
  const binary = path.join(cacheRoot, process.platform === "win32" ? "abapiti.exe" : "abapiti");
  run("go", [
    "build",
    "-trimpath",
    "-ldflags",
    `-X main.version=${abapitiCommit}`,
    "-o",
    binary,
    "./cmd/abapiti",
  ], {cwd: abapitiRoot});
  return {binary, goVersion, minimumGoVersion};
}

function getCoreSourceRoot() {
  if (!existsSync(coreSourceRoot)) {
    throw new Error(`Core TypeScript source directory not found: ${coreSourceRoot}`);
  }
  return coreSourceRoot;
}

function normalizeRelativePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function generateOutput(abapitiBinary, sourceRoot, abapitiCommit, goVersion, minimumGoVersion) {
  rmSync(generatedRoot, {recursive: true, force: true});
  mkdirSync(generatedRoot, {recursive: true});
  const sources = walkFiles(sourceRoot).filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts")).sort();
  const generated = [];
  const failures = [];
  let overlongNames = 0;
  let longLines = 0;
  let todoPlaceholders = 0;

  for (let index = 0; index < sources.length; index++) {
    const sourceFile = sources[index];
    const tempOutput = path.join(cacheRoot, "one-file-output");
    rmSync(tempOutput, {recursive: true, force: true});
    mkdirSync(tempOutput, {recursive: true});

    const result = run(abapitiBinary, [
      "compile",
      "ts",
      sourceFile,
      "--prefix",
      "zcl_",
      "--allow-long-lines",
      "--output",
      tempOutput,
    ], {cwd: abapitiRoot, allowFailure: true});
    const generatedFiles = walkFiles(tempOutput).filter((file) => file.endsWith(".clas.abap"));
    const sourceRelative = path.relative(sourceRoot, sourceFile);
    if (result.status !== 0) {
      failures.push({source: normalizeRelativePath(sourceRelative), message: (result.stderr || result.stdout || "").trim()});
    }

    for (const generatedFile of generatedFiles) {
      const contents = readFileSync(generatedFile, "utf8");
      const className = contents.match(/^CLASS\s+(\S+)\s+DEFINITION/im)?.[1] ?? path.basename(generatedFile, ".clas.abap");
      const relativeOutput = path.join(
        path.dirname(sourceRelative),
        path.basename(sourceRelative, ".ts"),
        path.basename(generatedFile),
      );
      const destination = path.join(generatedRoot, relativeOutput);
      if (existsSync(destination)) {
        throw new Error(`Duplicate generated output path: ${normalizeRelativePath(relativeOutput)}`);
      }
      mkdirSync(path.dirname(destination), {recursive: true});
      writeFileSync(destination, contents);
      const lines = contents.split(/\r?\n/);
      const maxLineLength = Math.max(0, ...lines.map((line) => line.length));
      if (className.length > 30) overlongNames++;
      if (maxLineLength > 255) longLines++;
      const todos = (contents.match(/" TODO:/g) || []).length;
      todoPlaceholders += todos;
      generated.push({
        source: normalizeRelativePath(sourceRelative),
        file: normalizeRelativePath(relativeOutput),
        className,
        lines: Math.max(0, lines.length - 1),
        maxLineLength,
        todoPlaceholders: todos,
      });
    }

    if ((index + 1) % 100 === 0 || index + 1 === sources.length) {
      console.log(`Transpiled ${index + 1}/${sources.length} core TypeScript source files`);
    }
  }

  const classCounts = new Map();
  for (const item of generated) {
    classCounts.set(item.className, (classCounts.get(item.className) || 0) + 1);
  }
  const duplicateClassNames = [...classCounts]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    generatedBy: "packages/morph2/scripts/transpile.mjs",
    core: {
      name: corePackage.name,
      version: corePackage.version,
      source: "packages/core/src",
    },
    abapiti: {...lock.abapiti, commit: abapitiCommit},
    goVersion,
    minimumGoVersion,
    summary: {
      typescriptModules: sources.length,
      generatedClasses: generated.length,
      duplicateClassNames: duplicateClassNames.length,
      classesOverAbapNameLimit: overlongNames,
      filesOverAbapLineLimit: longLines,
      todoPlaceholders,
      failedInputs: failures.length,
    },
    duplicateClassNames,
    failures,
    generated,
  };
  writeFileSync(path.join(generatedRoot, "transpile-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function publishOutput() {
  const existingManifest = path.join(finalOutput, "transpile-manifest.json");
  if (existsSync(finalOutput) && !existsSync(existingManifest)) {
    throw new Error(`Refusing to replace ${finalOutput}: it is not marked as generated by this script.`);
  }
  rmSync(finalOutput, {recursive: true, force: true});
  renameSync(generatedRoot, finalOutput);
}

const abapitiCommit = ensureAbapitiCheckout();
ensureAbapitiDependencies();
const {binary: abapitiBinary, goVersion, minimumGoVersion} = buildAbapiti(abapitiCommit);
const packageSourceRoot = getCoreSourceRoot();
const manifest = generateOutput(abapitiBinary, packageSourceRoot, abapitiCommit, goVersion, minimumGoVersion);
publishOutput();

console.log(`Generated ${manifest.summary.generatedClasses} ABAP class files under ${path.relative(packageRoot, finalOutput)}.`);
console.log(`Manifest: ${path.relative(packageRoot, path.join(finalOutput, "transpile-manifest.json"))}`);
if (manifest.summary.failedInputs > 0) {
  process.exitCode = 1;
  console.error(`${manifest.summary.failedInputs} input modules failed; details are in the manifest.`);
}
