import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {IRuleMetadata, RuleTag} from "../../../packages/core/build/src/rules/_irule";

// quick'n dirty, optimizes for search engine indexing

// todo: also link to unit test file from documentation?

const rawSchema = fs.readFileSync("../../packages/core/scripts/schema.json");

function preamble(dir = "") {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="keywords" content="ABAP,Open Source,abaplint,lint,linter,SAP,static analysis" />
  <title>rules.abaplint.org</title>
  <link rel="stylesheet" type="text/css" href="${dir}style.css">
</head>
<body>
<div class="content">`;
}

const postamble = `</div>
</body>
</html>`;

function quickfix() {
  // https://github.com/refactoringui/heroicons/blob/master/dist/outline-md/md-lightning-bolt.svg
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/quick_fix.html"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>quick fix</title><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></a>`;
}

function experimental() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/experimental.html"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>experimental</title><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></a>`;
}

function findDefault(ruleKey: string) {
  const def = abaplint.Config.getDefault();
  return JSON.stringify(def.readByRule(ruleKey), null, 2);
}

// todo, this is slow, its called for every rule, refactor
function findPath(ruleKey: string) {
  const base = "https://github.com/abaplint/abaplint/blob/master/packages/core/src/rules/";
  const test = ["", "naming/", "syntax/", "whitespace/"]; // todo, refactor
  for (const t of test) {
    const files = fs.readdirSync("../../packages/core/src/rules/" + t);
    for (const f of files) {
      if (f === ruleKey + ".ts") {
        return base + t + f;
      }
    }
  }
  throw new Error("not found: " + ruleKey);
}

function buildIndex() {
  let html = "<h1>abaplint rules documentation</h1>";

  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });
  for (const r of sorted) {
    const meta = r.getMetadata();
    html = html + "<a href='./" + meta.key + "/'><tt>" + meta.key + "</tt> - " + meta.title + "</a>";
    if (meta.quickfix === true) {
      html = html + quickfix();
    }
    if (meta.tags?.includes(RuleTag.Experimental)) {
      html = html + experimental();
    }
    html = html + "<br>" + meta.shortDescription + "<br><br>\n";


    buildRule(meta);
  }

  fs.writeFileSync("build/index.html", preamble() + html + postamble);
}

function render(str: string) {
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

function buildRule(meta: IRuleMetadata) {
  let html = "<h1>" + meta.key + " - " + meta.title + "</h1>\n";

  if (meta.quickfix === true) {
    html = html + quickfix();
  }
  if (meta.tags?.includes(RuleTag.Experimental)) {
    html = html + experimental();
  }
  const link = findPath(meta.key);
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  html = html + `&nbsp;<a href="${link}"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>edit</title><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></a>`;

  html = html + "<h2>Description</h2>\n" + meta.shortDescription + "<br><br>";

  if (meta.extendedInformation !== undefined && meta.extendedInformation !== "") {
    html = html + "<h2>Extended Information</h2>\n" + render(meta.extendedInformation) + "<br><br>";
  }

  html = html + "<h2>Default Configuration</h2>\n";
  html = html + editor(findDefault(meta.key), findSchema(meta.key));
  html = html + "<i>Hover to see descriptions, Ctrl+Space for suggestions</i>";

  if (meta.goodExample || meta.badExample) {
    html = html + "<h2>Examples</h2>\n";
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

function buildSchema() {
  fs.writeFileSync("build/schema.js", "const abaplintSchema = " + rawSchema);
}

function run() {
  fs.mkdirSync("build", {recursive: true});
  buildSchema();
  buildIndex();
}

run();