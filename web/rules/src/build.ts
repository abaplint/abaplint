import * as fs from "fs";
import * as abaplint from "../../../packages/core/build/src/index";
import {IRuleMetadata, RuleTag} from "../../../packages/core/build/src/rules/_irule";

// quick'n dirty, optimizes for search engine indexing

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

function upport() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/upport.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>upport</title><path d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></a>`;
}

function downport() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/downport.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>downport</title><path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></a>`;
}

function whitespace() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/whitespace.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>whitespace</title><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"></path></svg></a>`;
}

function naming() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/naming.html"><svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" height="2ch"><title>naming</title><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg></a>`;
}

function home() {
  // https://github.com/refactoringui/heroicons/
  // eslint-disable-next-line max-len
  return `&nbsp;<a href="/"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" height="2ch"><title>home</title><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></a>`;
}


function findDefault(ruleKey: string) {
  const def = abaplint.Config.getDefault();
  return JSON.stringify(def.readByRule(ruleKey), null, 2);
}

// todo, this is slow, its called for every rule, refactor
function findPath(ruleKey: string) {
  const base = "https://github.com/abaplint/abaplint/blob/master/packages/core/src/rules/";
  const test = ["", "syntax/"]; // todo, refactor
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

function renderIcons(meta: IRuleMetadata): string {
  let html = "";
  if (meta.quickfix === true) {
    html = html + quickfix();
  }
  if (meta.tags?.includes(RuleTag.Experimental)) {
    html = html + experimental();
  }
  if (meta.tags?.includes(RuleTag.Downport)) {
    html = html + downport();
  }
  if (meta.tags?.includes(RuleTag.Upport)) {
    html = html + upport();
  }
  if (meta.tags?.includes(RuleTag.Whitespace)) {
    html = html + whitespace();
  }
  if (meta.tags?.includes(RuleTag.Naming)) {
    html = html + naming();
  }
  return html;
}

function buildIndex() {
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
`;

  const sorted = abaplint.ArtifactsRules.getRules().sort((a, b) => {
    return a.getMetadata().key.localeCompare(b.getMetadata().key); });
  for (const r of sorted) {
    const meta = r.getMetadata();
    html = html + "<a href='./" + meta.key + "/'><tt>" + meta.key + "</tt> - " + meta.title + "</a>";
    html = html + renderIcons(meta);
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

  html = html + home();
  html = html + renderIcons(meta);
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

function buildSchema() {
  fs.writeFileSync("build/schema.js", "const abaplintSchema = " + rawSchema);
}

function run() {
  fs.mkdirSync("build", {recursive: true});
  buildSchema();
  buildIndex();
}

run();