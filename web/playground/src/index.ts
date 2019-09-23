import * as monaco from "monaco-editor";
import {CommandRegistry} from "@phosphor/commands";
import {BoxPanel, DockPanel, Menu, MenuBar, Widget} from "@phosphor/widgets";
import "../style/index.css";
import {EditorWidget, TreeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {AbapSnippetProvider} from "./monaco/AbapSnippetProvider";

const commands = new CommandRegistry();

function createMenu(): Menu {
  const root = new Menu({commands});
  root.addItem({command: "abaplint:add_file"});
  return root;
}

function main(): void {
  const tree = new TreeWidget();
  tree.id = "tree";

  const problems = new ProblemsWidget();
  problems.id = "problems";

  FileSystem.setup(tree, problems);

  commands.addCommand("abaplint:add_file", {
    label: "Add file",
    mnemonic: 0,
    iconClass: "fa fa-copy",
    execute: () => {
      FileSystem.addFile("sdf", "sdf");
    },
  });

  const menu1 = createMenu();
  menu1.title.label = "File";
  menu1.title.mnemonic = 0;

  const menu = new MenuBar();
  menu.addMenu(menu1);
  menu.id = "menuBar";

  const dock = new DockPanel();
  dock.id = "dock";
  for (const f of FileSystem.getFiles()) {
    const r1 = new EditorWidget(f.getFilename(), f.getRaw());
    dock.addWidget(r1);
  }
  BoxPanel.setStretch(dock, 1);

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
  e.preventDefault();
  e.returnValue = "Close?";
};

function registerMonacoSettings() {
  monaco.languages.registerCompletionItemProvider("abap", new AbapSnippetProvider());
}
