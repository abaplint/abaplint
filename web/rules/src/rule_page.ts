import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {IRuleMetadata} from "../../../packages/core/build/src/rules/_irule";
import {home, renderIcons, preamble, postamble} from "./common";

const rawSchema = fs.readFileSync("../../packages/core/scripts/schema.json");

function findDefault(ruleKey: string) {
  const def = abaplint.Config.getDefault();
  return JSON.stringify(def.readByRule(ruleKey), null, 2);
}

function renderExtended(str: string) {
  const exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return str.replace(exp_match, "<a href='$1'>$1</a>").replace(/\n/g, "<br>");
}

function findSchema(ruleKey: string): string {
  const json = JSON.parse(rawSchema.toString());
  const conf = json["definitions"]["IConfig"]["properties"]["rules"]["properties"][ruleKey]["anyOf"][0]["$ref"].split("/")[2];
  return conf;
}

function editor(json: string, schema: string) {
  const height = (json.split("\n").length + 2) * 19;

  return `<div id="defaultConfigEditor" style="width:700px;height:${height}px;border:1px solid grey"></div>
  <script src="/_monaco/vs/loader.js"></script>
  <script src="/schema.js"></script>
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
    });
  </script>`;
}

function findPath(ruleKey: string) {
  const base = "https://github.com/abaplint/abaplint/blob/master/packages/core/src/rules/";
  return base + ruleKey + ".ts";
}

export function buildRule(meta: IRuleMetadata) {
  let html = "<h1>" + meta.key + " - " + meta.title + "</h1>\n";

  html = html + home();
  html = html + renderIcons(meta);
  const link = findPath(meta.key);
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  html = html + `&nbsp;<a href="${link}"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>edit</title><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></a>`;

  html = html + "<h2>Description</h2>\n" + meta.shortDescription + "<br><br>";

  if (meta.extendedInformation !== undefined && meta.extendedInformation !== "") {
    html = html + "<h2>Extended Information</h2>\n" + renderExtended(meta.extendedInformation) + "<br><br>";
  }

  html = html + "<h2>Default Configuration</h2>\n";
  html = html + editor(findDefault(meta.key), findSchema(meta.key));
  html = html + "<i>Hover to see descriptions, Ctrl+Space for suggestions</i>";

  if (meta.goodExample || meta.badExample) {
    html = html + "<h2>Examples</h2>\n";
    if (meta.badExample) {
      html = html + "Bad example: <pre>" + meta.badExample + "</pre><br>";
    }
    if (meta.goodExample) {
      html = html + "Good example: <pre>" + meta.goodExample + "</pre>";
    }
    html = html + "<br><br>";
  }

  fs.mkdirSync("build/" + meta.key + "/", {recursive: true});
  fs.writeFileSync("build/" + meta.key + "/index.html", preamble("../") + html + postamble);
}