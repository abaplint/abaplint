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

function updateConfig(value?: any) {
  const config = abaplint.Config.getDefault().get();
  config.rules = {};
  config.rules.align_parameters = value || true;
  console.dir(config);
  reg.setConfig(new abaplint.Config(JSON.stringify(config)));
}

async function configChanged(configEditor: any) {
  const contents = configEditor.getValue();
  console.dir(contents);
  updateConfig(JSON.parse(contents));
  abapChanged();
}

function initABAP(abap: string) {
  reg.addFile(new abaplint.MemoryFile(filename, abap));
  updateConfig();
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