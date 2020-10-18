import * as abaplint from "@abaplint/core";
import * as path from "path";
import * as fs from "fs";
import {FileOperations} from "./file_operations";

export class Rename {
  private readonly reg: abaplint.IRegistry;

  public constructor(reg: abaplint.IRegistry) {
    this.reg = reg;
  }

  public run(config: abaplint.Config, base: string) {
    const rconfig = config.get().rename;
    if (rconfig === undefined) {
      return;
    }

    this.skip(rconfig);
    this.rename(rconfig);
    this.write(rconfig, base);
  }

  ////////////////////////

  private write(rconfig: abaplint.IRenameSettings, base: string) {
    const outputFolder = base + path.sep + rconfig.output;
    console.log("Base: " + base);
    console.log("Output folder: " + outputFolder);
    FileOperations.deleteFolderRecursive(outputFolder);

    for (const o of this.reg.getObjects()) {
      if (this.reg.isDependency(o) === true) {
        continue;
      }
      for (const f of o.getFiles()) {
        const n = outputFolder + f.getFilename().replace(base, "");
        console.log("Write " + n);
        fs.mkdirSync(path.dirname(n), {recursive: true});
        fs.writeFileSync(n, f.getRaw());
      }
    }
  }

  private rename(rconfig: abaplint.IRenameSettings) {
    const renamer = new abaplint.Rename(this.reg);
    for (const o of this.reg.getObjects()) {
      if (this.reg.isDependency(o) === true) {
        continue;
      }
      for (const p of rconfig.patterns || []) {
        if (!(o.getType().match(p.type))) {
          continue;
        }
        const regex = new RegExp(p.oldName, "i");
        const match = regex.exec(o.getName());
        if (!match) {
          continue;
        }
        const newStr = o.getName().replace(regex, p.newName);
        console.log("Renaming " + o.getName().padEnd(30, " ") + " -> " + newStr);
        renamer.rename(o.getType(), o.getName(), newStr);
      }
    }
  }

  private skip(rconfig: abaplint.IRenameSettings) {
    if (rconfig.skip) {
      for (const s of rconfig.skip) {
        const all: abaplint.IFile[] = [];
        for (const f of this.reg.getFiles()) {
          all.push(f);
        }
        for (const n of all) {
          if (n.getFilename().match(s)) {
            console.log(n.getFilename() + " skipped");
            this.reg.removeFile(n);
          }
        }
      }
      this.reg.parse();
    }
  }
}