import "../node_modules/@phosphor/default-theme/style/index.css";
import "./index.less";
import "../public/img/favicon-16x16.png";
import "../public/img/favicon-32x32.png";
import * as monaco from "monaco-editor";
import {CommandRegistry} from "@phosphor/commands";
import {BoxPanel, DockPanel, Menu, MenuBar, Widget} from "@phosphor/widgets";
import {WelcomeWidget, EditorWidget, TreeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {ABAPSnippetProvider} from "./monaco/abap_snippet_provider";
import {ABAPHoverProvider} from "./monaco/abap_hover_provider";
import {ABAPFormattingProvider} from "./monaco/abap_formatting_provider";
import {ABAPSymbolProvider} from "./monaco/abap_symbol_provider";
// import {ABAPCodeActionProvider} from "./monaco/abap_code_action_provider";

const commands = new CommandRegistry();

function main(): void {
  const tree = new TreeWidget();
  tree.id = "tree";

  const problems = new ProblemsWidget();
  problems.id = "problems";

  FileSystem.setup(tree, problems);

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
  for (const f of FileSystem.getFiles()) {
    dock.addWidget(new EditorWidget(f.getFilename(), f.getRaw()));
  }
  dock.addWidget(new WelcomeWidget());

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
//  monaco.languages.registerCodeActionProvider("abap", new ABAPCodeActionProvider());

  /* todo, the schema must be fetched via http first? note CORS on github
  alternatively add it here at compile time
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: "https://schema.abaplint.org/schema.json",
      fileMatch: ["abaplint.json"],
    }],
  });
  */
}
