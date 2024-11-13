import {ProblemsWidget, EditorWidget} from "./widgets";
import {Registry, IRegistry, Config, MemoryFile, IFile} from "@abaplint/core";
import {DockPanel} from "@phosphor/widgets";

// magic God class
export class FileSystem {
  private static files: MemoryFile[];
  private static reg: IRegistry;
  private static problems: ProblemsWidget;
  private static dock: DockPanel;

  public static setup(problems: ProblemsWidget, dock: DockPanel) {
    this.files = [];
    this.reg = new Registry();
    this.dock = dock;
    this.problems = problems;

    this.addFile("abaplint.json", JSON.stringify(Config.getDefault().get(), undefined, 2));
    this.addFile(
      "zfoobar.prog.abap",
      `REPORT zfoobar.
 WRITE 'Hello World'.

DATA moo TYPE i VALUE 2.
WRITE moo.
moo = 4.

LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<ls_foo>).
  WRITE 'bar'.
ENDLOOP.

FORM foo.
  DATA boo TYPE i.
ENDFORM.`);
    this.addFile("zfoo.ddls.asddls",
                 `@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello World,.:'
define view entity zfoo
  as select from tadir
{
  pgmid,
  object,
  obj_name
}`);

    return this.reg;
  }

  private static updateConfig(contents: string) {
    try {
      const conf = new Config(contents);
      this.reg.setConfig(conf).parse();

      for (const f of this.files) {
        if (f.getFilename().endsWith(".abap")) {
          const editor = this.findEditor(f);
          if (editor) {
            // force update to update diagnostics
            editor.getModel()?.setValue(editor.getModel()?.getValue());
          }
        }
      }
    } catch {
      return;
    }
  }

  public static openFile(filename: string) {
    const f = this.getFile(filename);
    if (f) {
      const editor = this.findEditor(f);
      if (editor) {
        this.dock.activateWidget(editor);
      } else {
        const w = new EditorWidget(f.getFilename(), f.getRaw());
        this.dock.addWidget(w);
        this.dock.activateWidget(w);
      }
    }
  }

  private static findEditor(f: IFile): EditorWidget | undefined {
    const it = this.dock.children();
    for (;;) {
      const res = it.next();
      if (res === undefined) {
        break;
      } else if (res instanceof EditorWidget) {
        if (res.getModel().uri.toString() === f.getFilename()) {
          return res;
        }
      }
    }
    return undefined;
  }

  public static getFile(filename: string): IFile | undefined {
    for (const f of this.getFiles()) {
      if (f.getFilename() === filename || f.getFilename() === "file://" + filename) {
        return f;
      }
    }
    return undefined;
  }

  public static updateFile(filename: string, contents: string) {
    if (filename === "file:///abaplint.json") {
      this.updateConfig(contents);
    } else {
      const file = new MemoryFile(filename, contents);
      this.reg.updateFile(file);
    }
    this.update();
  }

  public static addFile(filename: string, contents: string) {
    const file = new MemoryFile("file:///" + filename, contents);
    if (file.getFilename() === "file:///abaplint.json") {
      this.updateConfig(contents);
    } else {
      this.reg.addFile(file);
    }
    this.files.push(file);
    this.update();
  }

  public static getFiles(): IFile[] {
    return this.files;
  }

  public static getRegistry(): IRegistry {
    return this.reg;
  }

  public static getIssues(filename?: string) {
    if (filename) {
      const issues = this.reg.findIssues();
      const ret = [];
      for (const i of issues) { // blah
        if (i.getFilename() === filename) {
          ret.push(i);
        }
      }
      return ret;
    } else {
      return this.reg.findIssues();
    }
  }

  private static update() {
    this.problems.updateIt();
  }

}