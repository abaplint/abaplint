import * as abaplint from "@abaplint/core";
import * as abapMonaco from "@abaplint/monaco";

declare const monaco: any;
const filename = "file:///zfoobar.prog.abap";
const reg = new abaplint.Registry();

let model: any;
let editor: any;

async function abapChanged() {
  const contents = editor.getValue();
  const file = new abaplint.MemoryFile(filename, contents);
  reg.updateFile(file);
  reg.parse();
  abapMonaco.updateMarkers(reg, model);
}

function updateConfig(ruleName: string, value?: any) {
  const config = abaplint.Config.getDefault().get();
  config.rules = {};
  config.rules[ruleName] = value || true;
  reg.setConfig(new abaplint.Config(JSON.stringify(config)));
}

async function configChanged(configEditor: any, ruleName: string) {
  const contents = configEditor.getValue();
  try {
    const parsed = JSON.parse(contents);
    updateConfig(ruleName, parsed);
  } catch {
    return;
  }
  abapChanged();
}

function initABAP(abap: string, ruleName: string) {
  reg.addFile(new abaplint.MemoryFile(filename, abap));
  updateConfig(ruleName);
  abapMonaco.registerABAP(reg);

  const modelUri = monaco.Uri.parse(filename);

  model = monaco.editor.createModel(abap, "abap", modelUri);

  editor = monaco.editor.create(document.getElementById("examplesEditor"), {
    model: model,
    autoClosingBrackets: false,
    minimap: {enabled: false},
    theme: "vs-dark",
  });

  editor.onDidChangeModelContent(abapChanged);
  abapChanged();
}

// @ts-ignore
globalThis.initABAP = initABAP;
// @ts-ignore
globalThis.configChanged = configChanged;