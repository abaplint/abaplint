import {existsSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(packageRoot, "output");
const classesFolder = path.join(outputRoot, "classes");
const manifestPath = path.join(outputRoot, "abaplint-release-manifest.json");

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function abapGitXml(serializer, values) {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="${serializer}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
${values}
  </asx:values>
 </asx:abap>
</abapGit>
`;
}

// "* TS: src/_config.ts:87:1 IConfig" becomes "IConfig, src/_config.ts", which fits the 60 character DESCRIPT
function description(source, fallback) {
  const match = /^\* TS: (\S+?):\d+:\d+ (.+)$/m.exec(source.split("\n", 1)[0]);
  const text = match ? `${match[2].trim()}, ${match[1]}` : fallback;
  return text.length > 60 ? text.substring(0, 57) + "..." : text;
}

function superclassOf(source) {
  return /^CLASS \S+ DEFINITION\b[^.]*\bINHERITING FROM (\S+?)[\s.]/im.exec(source)?.[1].toLowerCase();
}

if (!existsSync(classesFolder)) {
  throw new Error(`${classesFolder} does not exist, run the transpilation first`);
}
const release = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf-8")).abapitiRelease : undefined;
const fallbackDescription = `abaplint translated by abapiti ${release ?? ""}`.trim();

const objects = new Map();
for (const filename of readdirSync(classesFolder).sort()) {
  const match = /^([^.]+)\.(clas|intf)\.abap$/.exec(filename);
  if (match) {
    objects.set(match[1], {type: match[2], source: readFileSync(path.join(classesFolder, filename), "utf-8")});
  }
}

// exception classes need CATEGORY 40, follow the inheritance through the generated classes
function isException(name, seen = new Set()) {
  const superclass = objects.get(name)?.type === "clas" ? superclassOf(objects.get(name).source) : undefined;
  if (superclass === undefined || seen.has(superclass)) {
    return false;
  }
  seen.add(superclass);
  return /^cx_/.test(superclass) || isException(superclass, seen);
}

let exceptions = 0;
for (const [name, {type, source}] of objects) {
  const descript = escapeXml(description(source, fallbackDescription));
  let xml;
  if (type === "clas") {
    const exception = isException(name);
    exceptions += exception ? 1 : 0;
    xml = abapGitXml("LCL_OBJECT_CLAS", `   <VSEOCLASS>
    <CLSNAME>${name.toUpperCase()}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>${descript}</DESCRIPT>${exception ? "\n    <CATEGORY>40</CATEGORY>" : ""}
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>`);
  } else {
    xml = abapGitXml("LCL_OBJECT_INTF", `   <VSEOINTERF>
    <CLSNAME>${name.toUpperCase()}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>${descript}</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>`);
  }
  writeFileSync(path.join(classesFolder, `${name}.${type}.xml`), xml);
}

console.log(`Wrote abapGit XML for ${objects.size} objects (${exceptions} exception classes).`);
