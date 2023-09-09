import * as abaplint from "@abaplint/core";
import * as path from "path";
import {FileOperations} from "./file_operations";
import {PartialFS} from "./partial_fs";

export class Rename {
  private readonly reg: abaplint.IRegistry;
  private readonly deletedFiles: Set<string>;
  private readonly addedFiles: Set<string>;
  private readonly updatedFiles: Set<string>;

  public constructor(reg: abaplint.IRegistry) {
    this.reg = reg;

    this.deletedFiles = new Set<string>();
    this.addedFiles = new Set<string>();
    this.updatedFiles = new Set<string>();
  }

  public run(config: abaplint.IConfig, base: string, fs: PartialFS, quiet?: boolean) {
    const rconfig = config.rename;
    if (rconfig === undefined) {
      return;
    }

    this.skip(rconfig);
    this.rename(rconfig, quiet);
    if (rconfig.output === undefined || rconfig.output === "") {
      // write changes inline
      this.deletedFiles.forEach(f => {
        if (quiet !== true) {
          console.log("rm " + f);
        }
        fs.rmSync(f);
      });
      this.addedFiles.forEach(f => {
        if (quiet !== true) {
          console.log("write " + f);
        }
        const file = this.reg.getFileByName(f);
        if (file !== undefined) {
          fs.writeFileSync(file.getFilename(), file.getRaw());
        }
      });
      this.updatedFiles.forEach(f => {
        if (quiet !== true) {
          console.log("update " + f);
        }
        const file = this.reg.getFileByName(f);
        if (file !== undefined) {
          fs.writeFileSync(file.getFilename(), file.getRaw());
        }
      });
    } else {
      // output full registry contents to output folder
      this.write(rconfig, base, fs);
    }
  }

  ////////////////////////

  private write(rconfig: abaplint.IRenameSettings, base: string, fs: PartialFS) {
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

  private rename(rconfig: abaplint.IRenameSettings, quiet?: boolean) {
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
        if (quiet !== true) {
          console.log("Renaming " + o.getType() + " " + o.getName().padEnd(30, " ") + " -> " + newStr);
        }

        const result = renamer.rename(o.getType(), o.getName(), newStr);
        result.updatedFiles.forEach(f => { this.updatedFiles.add(f); });
        result.deletedFiles.forEach(f => { this.deletedFiles.add(f); });
        result.addedFiles.forEach(f => { this.addedFiles.add(f); });
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