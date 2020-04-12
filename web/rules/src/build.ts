import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {IRuleMetadata} from "../../../packages/core/build/src/rules/_irule";

function buildIndex() {
  let html = "";

  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });
  for (const r of sorted) {
    const meta = r.getMetadata();
    html = html + "<a href='./" + meta.key + "/'><tt>" + meta.key + "</tt> - " + meta.title + "</a><br>" +
      meta.shortDescription + "<br><br>\n";

    buildRule(meta);
  }

  fs.writeFileSync("build/index.html", html);
}

function buildRule(meta: IRuleMetadata) {
  let html = "<h1>" + meta.key + " - " + meta.title + "</h1>\n";

  html = html + "quickfix: " + meta.quickfix + "<br><br>";

  html = html + "<u>Description</u><br>\n" + meta.shortDescription + "<br><br>";

  html = html + "<u>Extended Information</u><br>\n" + meta.extendedInformation + "<br><br>";

  html = html + "<u>Schema</u><br>\ntodo" + "<br><br>";

  html = html + "<u>Examples</u><br>\ntodo" + "<br><br>";

  fs.mkdirSync("build/" + meta.key + "/", {recursive: true});
  fs.writeFileSync("build/" + meta.key + "/index.html", html);
}

function run() {
  fs.mkdirSync("build", {recursive: true});
  buildIndex();
}

run();