import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {IRuleMetadata} from "../../../packages/core/build/src/rules/_irule";

// quick'n dirty, optimizes for search engine indexing
// also works on localhost without running web server

function preamble(dir = "") {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>rules.abaplint.org</title>
  <link rel="stylesheet" type="text/css" href="${dir}style.css">
</head>
<body>
<div class="content">`;
}

const postamble = `</div>
</body>
</html>`;

function buildIndex() {
  let html = "<h1>abaplint rules documentation</h1>";

  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });
  for (const r of sorted) {
    const meta = r.getMetadata();
    html = html + "<a href='./" + meta.key + "/'><tt>" + meta.key + "</tt> - " + meta.title + "</a><br>" +
      meta.shortDescription + "<br><br>\n";

    buildRule(meta);
  }

  fs.writeFileSync("build/index.html", preamble() + html + postamble);
}

function buildRule(meta: IRuleMetadata) {
  let html = "<h1>" + meta.key + " - " + meta.title + "</h1>\n";

  html = html + "quickfix: " + meta.quickfix + "<br><br>";

  html = html + "<u>Description</u><br>\n" + meta.shortDescription + "<br><br>";

  if (meta.extendedInformation !== undefined && meta.extendedInformation !== "") {
    html = html + "<u>Extended Information</u><br>\n" + meta.extendedInformation + "<br><br>";
  }

  html = html + "<u>Schema</u><br>\ntodo" + "<br><br>";

  if (meta.goodExample || meta.badExample) {
    html = html + "<u>Examples</u><br>\n";
    if (meta.badExample) {
      html = html + "Bad example: <tt>" + meta.badExample + "</tt><br>";
    }
    if (meta.goodExample) {
      html = html + "Good example: <tt>" + meta.goodExample + "</tt>";
    }
    html = html + "<br><br>";
  }

  fs.mkdirSync("build/" + meta.key + "/", {recursive: true});
  fs.writeFileSync("build/" + meta.key + "/index.html", preamble("../") + html + postamble);
}

function run() {
  fs.mkdirSync("build", {recursive: true});
  buildIndex();
}

run();