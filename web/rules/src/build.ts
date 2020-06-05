import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {renderIcons, preamble, postamble, experimentalIcon, upportIcon, whitespaceIcon, namingIcon, syntaxIcon, styleguideIcon, downportIcon} from "./common";
import {buildRule} from "./rule_page";
import {RuleTag} from "../../../packages/core/build/src/rules/_irule";

// quick'n dirty, optimizes for search engine indexing

function buildChips(json: any) {
  let html = "";
  for (const tag in RuleTag) {
    let icon = "";

    switch(tag) {
      case RuleTag.Experimental:
        icon = experimentalIcon;
        break;
      case RuleTag.Upport:
        icon = upportIcon;
        break;
      case RuleTag.Downport:
        icon = downportIcon;
        break;
      case RuleTag.Whitespace:
        icon = whitespaceIcon;
        break;
      case RuleTag.Naming:
        icon = namingIcon;
        break;
      case RuleTag.Syntax:
        icon = syntaxIcon;
        break;
      case RuleTag.Styleguide:
        icon = styleguideIcon;
        break;
      case RuleTag.Downport:
        icon = downportIcon;
        break;
    }

    let count = 0;
    for (const rule of json) {
      if (rule.tags.includes(tag)) {
        count++;
      }
    }
    if (count > 0) {
      html = html + `<div class="chip" title="${tag}">
    <div class="chip-head">${count}</div>
    <div class="chip-content">${icon}</div>
  </div>\n`;
    }
  }
  return html;
}

function buildIndex() {

  const json: any = [];
  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });

    for (const r of sorted) {
      const meta = r.getMetadata();
      json.push({
        key: meta.key,
        title: meta.title,
        description: meta.shortDescription,
        tags: meta.tags ? meta.tags : []});
    }

  fs.writeFileSync("build/rules.json", JSON.stringify(json, null, 2));

  let html = `<h1>abaplint rules documentation</h1>
abaplint can be configured by placing a <tt>abaplint.json</tt> file in the root of the git repository.
If no configuration file is found, the default configuration will be used, which contains have all rules enabled.
<br><br>
Get default configuration by running <tt>abaplint -d > abaplint.json</tt>
<br><br>
<a href="https://github.com/FreHu/abaplint-clean-code">abaplint-clean-code</a> contains rule
documentation as well as abaplint.json definitions which attempt to align abaplint with the official
<a href="https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md">Clean ABAP styleguide</a>.

<h2>Rules</h2>
${buildChips(json)}
<br>
<br>
<div id="rules">
`;

  for (const r of sorted) {
    const meta = r.getMetadata();
    html = html + "<a href='./" + meta.key + "/'><tt>" + meta.key + "</tt> - " + meta.title + "</a>";
    html = html + renderIcons(meta);
    html = html + "<br>" + meta.shortDescription + "<br><br>\n";

    buildRule(meta);
  }
  html = html + "</div>";

  fs.writeFileSync("build/index.html", preamble() + html + postamble);
}

const rawSchema = fs.readFileSync("../../packages/core/scripts/schema.json");

function buildSchema() {
  fs.writeFileSync("build/schema.js", "const abaplintSchema = " + rawSchema);
}

function run() {
  fs.mkdirSync("build", {recursive: true});
  buildSchema();
  buildIndex();
}

run();