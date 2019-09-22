import {CommandRegistry} from '@phosphor/commands';
import {BoxPanel, DockPanel, Menu, MenuBar, Widget} from '@phosphor/widgets';
import '../style/index.css';
import * as monaco from 'monaco-editor';
import {EditorWidget, TreeWidget, ProblemsWidget} from './widgets/';
import {FileSystem} from './filesystem';


const commands = new CommandRegistry();

function createMenu(): Menu {
  let root = new Menu({ commands });
  root.addItem({ command: 'abaplint:add_file' });
  return root;
}

function setupMonaco() {
  monaco.languages.register({id: "abap"});
// todo, add json and xml?
}

function setupFiles() {
  const files = new FileSystem();
  files.addFile("zfoobar.prog.abap",
`REPORT zfoobar.
 WRITE 'Hello World'.

LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<ls_foo>).
  WRITE 'bar'.
ENDLOOP.`);
  files.addFile("abaplint.json", "todo");
  return files;
}

function main(): void {

  setupMonaco();
  const fileSystem = setupFiles();

  commands.addCommand('abaplint:add_file', {
    label: 'Add file',
    mnemonic: 0,
    iconClass: 'fa fa-copy',
    execute: () => {
      fileSystem.addFile("sdf", "sdf");
    }
  });

  let menu1 = createMenu();
  menu1.title.label = 'File';
  menu1.title.mnemonic = 0;

  let menu = new MenuBar();
  menu.addMenu(menu1);
  menu.id = 'menuBar';

  let dock = new DockPanel();
  dock.id = 'dock';
  for (const f of fileSystem.getFiles()) {
    let r1 = new EditorWidget(f, fileSystem);
    dock.addWidget(r1);
  }
  BoxPanel.setStretch(dock, 1);

  let tree = new TreeWidget(fileSystem);
  tree.id = "tree";

  let problems = new ProblemsWidget();
  problems.id = "problems";

  let left = new BoxPanel({ direction: "top-to-bottom", spacing: 0 });
  left.id = 'left';
  left.addWidget(dock);
  left.addWidget(problems);

  let main = new BoxPanel({ direction: 'left-to-right', spacing: 0 });
  main.id = 'main';
  main.addWidget(tree);
  main.addWidget(left);


  window.onresize = () => { main.update(); };
  Widget.attach(menu, document.body);
  Widget.attach(main, document.body);
}

window.onload = main;
