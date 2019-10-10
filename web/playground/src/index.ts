import "../node_modules/@phosphor/default-theme/style/index.css";
import "./index.less";
import "../public/img/favicon-16x16.png";
import "../public/img/favicon-32x32.png";
import schema from "../../../scripts/schema.json";
import * as monaco from "monaco-editor";
import {CommandRegistry} from "@phosphor/commands";
import {BoxPanel, DockPanel, Menu, MenuBar, Widget} from "@phosphor/widgets";
import {WelcomeWidget, TreeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {ABAPSnippetProvider} from "./monaco/abap_snippet_provider";
import {ABAPHoverProvider} from "./monaco/abap_hover_provider";
import {ABAPFormattingProvider} from "./monaco/abap_formatting_provider";
import {ABAPSymbolProvider} from "./monaco/abap_symbol_provider";
import {ABAPDefinitionProvider} from "./monaco/abap_definition_provider";

const commands = new CommandRegistry();

function main(): void {
  const tree = new TreeWidget();
  tree.id = "tree";

  const problems = new ProblemsWidget();
  problems.id = "problems";

  commands.addCommand("abaplint:goto_syntax_diagrams", {
    label: "Syntax Diagrams",
    mnemonic: 0,
    iconClass: "fa fa-align-center",
    execute: () => {
      window.open("https://syntax.abaplint.org");
    },
  });

  const menu1 = new Menu({commands});
  menu1.addItem({command: "abaplint:goto_syntax_diagrams"});
  menu1.title.label = "File";
  menu1.title.mnemonic = 0;

  const menu = new MenuBar();
  menu.addMenu(menu1);
  menu.id = "menuBar";

  const dock = new DockPanel();
  dock.id = "dock";
  BoxPanel.setStretch(dock, 1);

  FileSystem.setup(tree, problems, dock);

  dock.addWidget(new WelcomeWidget());
  FileSystem.openFile("file:///zfoobar.prog.abap");

  const left = new BoxPanel({direction: "top-to-bottom", spacing: 0});
  left.id = "left";
  left.addWidget(dock);
  left.addWidget(problems);

  const mainBox = new BoxPanel({direction: "left-to-right", spacing: 0});
  mainBox.id = "main";
  mainBox.addWidget(tree);
  mainBox.addWidget(left);

  window.onresize = () => { mainBox.update(); };
  Widget.attach(menu, document.body);
  Widget.attach(mainBox, document.body);

  registerMonacoSettings();
}

window.onload = main;

window.onbeforeunload = function (e: any) {
  // todo, some fix for not accidentally hitting Ctrl+W, but still works with hot reloading for local development
  // e.preventDefault();
  // e.returnValue = "Close?";
};

function registerMonacoSettings() {
  monaco.languages.registerCompletionItemProvider("abap", new ABAPSnippetProvider());
  monaco.languages.registerHoverProvider("abap", new ABAPHoverProvider());
  monaco.languages.registerDocumentFormattingEditProvider("abap", new ABAPFormattingProvider());
  monaco.languages.registerDocumentSymbolProvider("abap", new ABAPSymbolProvider());
  monaco.languages.registerDefinitionProvider("abap", new ABAPDefinitionProvider());

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: "https://schema.abaplint.org/schema.json",
      fileMatch: ["abaplint.json"],
      schema: schema,
    }],
  });
}
