import {TreeWidget, ProblemsWidget} from "./widgets";
import {Registry} from "abaplint/registry";
import {Config} from "abaplint/config";
import {MemoryFile} from "abaplint/files";

// magic god class
export class FileSystem {
  private static files: MemoryFile[];
  private static reg: Registry;
  private static tree: TreeWidget;
  private static problems: ProblemsWidget;
  private static current: string;

  public static setup(tree: TreeWidget, problems: ProblemsWidget) {
    this.files = [];
    this.reg = new Registry();
    this.tree = tree;
    this.problems = problems;

    this.addFile(
"zfoobar.prog.abap",
`REPORT zfoobar.
 WRITE 'Hello World'.

LOOP AT lt_foo ASSIGNING FIELD-SYMBOL(<ls_foo>).
  WRITE 'bar'.
ENDLOOP.`);
    this.addFile("abaplint.json", JSON.stringify(Config.getDefault().get(), undefined, 2));
  }

  public static getCurrentFile(): string {
    return this.current;
  }

  public static setCurrentFile(file: string): void {
    this.current = file;
  }

  private static updateConfig(contents: string) {
    try {
      const conf = new Config(contents);
      this.reg.setConfig(conf);
    } catch {
      return;
    }
  }

  public static updateFile(filename: string, contents: string) {
    if (filename === "abaplint.json") {
      this.updateConfig(contents);
    } else {
      const file = new MemoryFile(filename, contents);
      this.reg.updateFile(file);
    }
    this.update();
  }

  public static addFile(filename: string, contents: string) {
    const file = new MemoryFile(filename, contents);
    if (filename === "abaplint.json") {
      this.updateConfig(contents);
    } else {
      this.reg.addFile(file);
    }
    this.files.push(file);
    this.update();
  }

  public static getFiles(): MemoryFile[] {
    return this.files;
  }

  public static getRegistry(): Registry {
    return this.reg;
  }

  public static getIssues(filename?: string) {
    if (filename) {
      const issues = this.reg.findIssues();
      const ret = [];
      for (const i of issues) { // blah
        if (i.getFile().getFilename() === filename) {
          ret.push(i);
        }
      }
      return ret;
    } else {
      return this.reg.findIssues();
    }
  }

  private static update() {
    this.tree.update();
    this.problems.updateIt();
  }

}