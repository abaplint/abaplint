import {crc32, deflateRawSync} from "node:zlib";
import {existsSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(packageRoot, "output");
const classesFolder = path.join(outputRoot, "classes");
const zipPath = path.join(outputRoot, "abaplint-classes-abapgit.zip");
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

if (!existsSync(classesFolder)) {
  throw new Error(`${classesFolder} does not exist, run the transpilation first`);
}
const release = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf-8")).abapitiRelease : undefined;
const fallbackDescription = `abaplint translated by abapiti ${release ?? ""}`.trim();

const files = [];
files.push({name: ".abapgit.xml", data: `<?xml version="1.0" encoding="utf-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <MASTER_LANGUAGE>E</MASTER_LANGUAGE>
   <STARTING_FOLDER>/src/</STARTING_FOLDER>
   <FOLDER_LOGIC>PREFIX</FOLDER_LOGIC>
  </DATA>
 </asx:values>
</asx:abap>
`});
files.push({name: "src/package.devc.xml", data: abapGitXml("LCL_OBJECT_DEVC", `   <DEVC>
    <CTEXT>${escapeXml(fallbackDescription)}</CTEXT>
   </DEVC>`)});

// the object XML is written by abapgit-xml.mjs before abaplint --fix, so pack the files as they are now
let objects = 0;
for (const filename of readdirSync(classesFolder).sort()) {
  const match = /^([^.]+)\.(clas|intf)\.abap$/.exec(filename);
  if (!match) {
    continue;
  }
  const xmlFilename = `${match[1]}.${match[2]}.xml`;
  if (!existsSync(path.join(classesFolder, xmlFilename))) {
    throw new Error(`${xmlFilename} is missing, run scripts/abapgit-xml.mjs first`);
  }
  objects++;
  files.push({name: `src/${filename}`, data: readFileSync(path.join(classesFolder, filename), "utf-8")});
  files.push({name: `src/${xmlFilename}`, data: readFileSync(path.join(classesFolder, xmlFilename), "utf-8")});
}

// minimal zip writer, deflate only, fixed timestamp so identical input gives an identical zip
const dosTime = 0;
const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
const localParts = [];
const centralParts = [];
let offset = 0;
for (const file of files) {
  const name = Buffer.from(file.name, "utf-8");
  const data = Buffer.from(file.data, "utf-8");
  const compressed = deflateRawSync(data);
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(dosTime, 10);
  local.writeUInt16LE(dosDate, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  local.writeUInt16LE(0, 28);
  localParts.push(local, name, compressed);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(dosTime, 12);
  central.writeUInt16LE(dosDate, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);
  centralParts.push(central, name);

  offset += local.length + name.length + compressed.length;
}
const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralSize, 12);
end.writeUInt32LE(offset, 16);
writeFileSync(zipPath, Buffer.concat([...localParts, ...centralParts, end]));

console.log(`Packed ${objects} objects into ${path.relative(packageRoot, zipPath)}.`);
