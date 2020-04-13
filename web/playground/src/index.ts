import "../node_modules/@phosphor/default-theme/style/index.css";
import "./index.less";
import "../public/img/favicon-16x16.png";
import "../public/img/favicon-32x32.png";
import schema from "../../../packages/core/scripts/schema.json";
import * as monaco from "monaco-editor";
import {BoxPanel, DockPanel, Widget} from "@phosphor/widgets";
import {WelcomeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {ABAPSnippetProvider} from "./monaco/abap_snippet_provider";
import {ABAPRenameProvider} from "./monaco/abap_rename_provider";
import {ABAPHoverProvider} from "./monaco/abap_hover_provider";
import {ABAPFormattingProvider} from "./monaco/abap_formatting_provider";
import {ABAPSymbolProvider} from "./monaco/abap_symbol_provider";
import {ABAPDefinitionProvider} from "./monaco/abap_definition_provider";
import {ABAPDocumentHighlightProvider} from "./monaco/abap_document_highlight_provider";
import {ABAPCodeActionProvider} from "./monaco/abap_code_action_provider";
import {ABAPImplementationProvider} from "./monaco/abap_implementation_provider";

function main(): void {
  const problems = new ProblemsWidget();
  problems.id = "problems";

  const dock = new DockPanel();
  dock.id = "dock";
  BoxPanel.setStretch(dock, 1);

  FileSystem.setup(problems, dock);

  dock.addWidget(new WelcomeWidget());
  FileSystem.openFile("file:///abaplint.json");
  FileSystem.openFile("file:///zfoobar.prog.abap");

  const left = new BoxPanel({direction: "top-to-bottom", spacing: 0});
  left.id = "left";
  left.addWidget(dock);
  left.addWidget(problems);

  const mainBox = new BoxPanel({direction: "left-to-right", spacing: 0});
  mainBox.id = "main";
  mainBox.addWidget(left);

  window.onresize = () => { mainBox.update(); };
  Widget.attach(mainBox, document.body);

  registerMonacoSettings();
}

window.onload = main;

function registerMonacoSettings() {
  monaco.languages.registerCompletionItemProvider("abap", new ABAPSnippetProvider());
  monaco.languages.registerHoverProvider("abap", new ABAPHoverProvider());
  monaco.languages.registerDocumentFormattingEditProvider("abap", new ABAPFormattingProvider());
  monaco.languages.registerDocumentSymbolProvider("abap", new ABAPSymbolProvider());
  monaco.languages.registerDefinitionProvider("abap", new ABAPDefinitionProvider());
  monaco.languages.registerRenameProvider("abap", new ABAPRenameProvider());
  monaco.languages.registerDocumentHighlightProvider("abap", new ABAPDocumentHighlightProvider());
  monaco.languages.registerCodeActionProvider("abap", new ABAPCodeActionProvider());
  monaco.languages.registerImplementationProvider("abap", new ABAPImplementationProvider());

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: "https://schema.abaplint.org/schema.json",
      fileMatch: ["abaplint.json"],
      schema: schema,
    }],
  });
}
