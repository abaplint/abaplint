import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src";
import {IRuleMetadata, RuleTag} from "../../../packages/core/build/src/rules/_irule";
import {home, renderIcons, preamble, postamble, example} from "./common";

const rawSchema = fs.readFileSync("../../packages/core/scripts/schema.json");

function findDefault(ruleKey: string) {
  const def = abaplint.Config.getDefault();
  const res = JSON.stringify(def.readByRule(ruleKey), null, 2);
  return res.replace("\\", "\\\\");
}

function renderExtended(str: string) {
  const exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return str.replace(exp_match, "<a href='$1'>$1</a>").trim().replace(/\n/g, "<br>");
}

function findSchema(ruleKey: string): string {
  const json = JSON.parse(rawSchema.toString());
  const conf = json["definitions"]["IConfig"]["properties"]["rules"]["properties"][ruleKey]["anyOf"][0]["$ref"].split("/")[2];
  return conf;
}

function schemaEditor(json: string, schema: string, ruleName: string) {
  const height = (json.split("\n").length + 2) * 19;

  return `<div id="defaultConfigEditor" style="width:700px;height:${height}px;border:1px solid grey"></div>
  <script src="/_monaco/vs/loader.js"></script>
  <script src="/schema.js"></script>
  <script src="/pack.bundle.js"></script>
  <script>
    require.config({ paths: { 'vs': '/_monaco/vs' }});
    require(['vs/editor/editor.main'], function() {
      var modelUri = monaco.Uri.parse("a://b/foo.json");
      var model = monaco.editor.createModel(\`${json}\`, "json", modelUri);

      const schema = abaplintSchema;
      schema["$ref"] = "#/definitions/${schema}",

      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [{
          uri: "https://schema.abaplint.org/dummy.json",
          fileMatch: [modelUri.toString()],
          schema,
        }],
      });

      var editor = monaco.editor.create(document.getElementById('defaultConfigEditor'), {
        model: model,
        autoClosingBrackets: false,
        minimap: {enabled: false},
        theme: "vs-dark"
      });

      editor.onDidChangeModelContent(() => configChanged(editor, "${ruleName}"));
    });
  </script>`;
}

function examplesEditor(abap: string, ruleName: string) {
  const height = (abap.split("\n").length + 2) * 19;

  return `<div id="examplesEditor" style="width:700px;height:${height}px;border:1px solid grey"></div>
  <script>
    require.config({ paths: { 'vs': '/_monaco/vs' }});
    require(['vs/editor/editor.main'], function() {
      initABAP(\`${abap}\`, "${ruleName}");
    });
  </script>`;
}

function findPath(ruleKey: string) {
  const base = "https://github.com/abaplint/abaplint/blob/main/packages/core/src/rules/";
  return base + ruleKey + ".ts";
}

export function buildRule(meta: IRuleMetadata) {
  let html = `<h1>${meta.title}</h1>\n`;

  html += home();
  html += renderIcons(meta.tags);
  if (meta.badExample !== undefined) {
    html += example();
  }
  const link = findPath(meta.key);
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  html = html + `&nbsp;<a href="${link}"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>edit</title><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></a>\n`;

  html += `<p><tt>${meta.key}</tt><br>\n`;
  if (meta.pragma || meta.pseudoComment) {
    html += "<br>";
    if (meta.pragma) {
      html += "Pragma: <tt>" + meta.pragma + "</tt><br>\n";
    }
    if (meta.pseudoComment) {
      html += "Pseudo comment: <tt>" + meta.pseudoComment + "</tt><br>\n";
    }
  }
  html += "</p>\n";

  html = html + "<h2>Description</h2>\n<p>" + meta.shortDescription + "</p>";

  if (meta.tags?.includes(RuleTag.Experimental)) {
    html += `<font color="red">EXPERIMENTAL</font>`;
  }

  if (meta.extendedInformation !== undefined && meta.extendedInformation !== "") {
    html = html + "<h2>Extended Information</h2>\n<p>" + renderExtended(meta.extendedInformation) + "</p>";
  }

  html = html + "<h2>Default Configuration</h2>\n";
  html = html + schemaEditor(findDefault(meta.key), findSchema(meta.key), meta.key);
  html = html + "<i>Hover to see descriptions, Ctrl+Space for suggestions</i>";

  if (meta.goodExample || meta.badExample) {
    html += "<h2>Examples</h2>\n";
    let abap = "";
    if (meta.badExample) {
      abap += "* Bad example\n" + meta.badExample;
    }
    if (meta.goodExample) {
      if (abap !== "") {
        abap += "\n\n";
      }
      abap += "* Good example\n" + meta.goodExample;
    }
    html += examplesEditor(abap, meta.key) + "<br><br>";
  }

  fs.mkdirSync("build/" + meta.key + "/", {recursive: true});
  fs.writeFileSync("build/" + meta.key + "/index.html", preamble() + html + postamble);
}
