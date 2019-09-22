import {CommandRegistry} from "@phosphor/commands";
import {BoxPanel, DockPanel, Menu, MenuBar, Widget} from "@phosphor/widgets";
import "../style/index.css";
import {EditorWidget, TreeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {Config} from "abaplint/config";

const commands = new CommandRegistry();

function createMenu(): Menu {
  const root = new Menu({commands});
  root.addItem({command: "abaplint:add_file"});
  return root;
}

function setupFiles() {
  FileSystem.addFile(
"zfoobar.prog.abap",
`REPORT zfoobar.
 WRITE 'Hello World'.

LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<ls_foo>).
  WRITE 'bar'.
ENDLOOP.`);
  FileSystem.addFile("abaplint.json", JSON.stringify(Config.getDefault(), undefined, 2));
}

function main(): void {

  setupFiles();

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
    const r1 = new EditorWidget(f);
    dock.addWidget(r1);
  }
  BoxPanel.setStretch(dock, 1);

  const tree = new TreeWidget();
  tree.id = "tree";

  const problems = new ProblemsWidget();
  problems.id = "problems";

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
}

window.onload = main;
