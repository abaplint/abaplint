import * as abaplint from "@abaplint/core";
import * as path from "path";
import {FileOperations} from "./file_operations";
import {PartialFS} from "./partial_fs";

interface IRename {
  type: string;
  oldName: string;
  newName: string;
  maxLength: number;
}

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
    const renamer = this.rename(rconfig, quiet);
    if (rconfig.urls === true) {
      const result = renamer.renameURLs();
      result.updatedFiles.forEach(f => {
        if (this.addedFiles.has(f) === false) {
          this.updatedFiles.add(f);
        }
      });
    }
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
    const outputFolder = base + path.posix.sep + rconfig.output;
    console.log("Base: " + base);
    console.log("Output folder: " + outputFolder);
    FileOperations.deleteFolderRecursive(outputFolder);

    const myBase = path.resolve(base);

    for (const o of this.reg.getObjects()) {
      if (this.reg.isDependency(o) === true) {
        continue;
      }
      for (const f of o.getFiles()) {
        // strip the long-path prefix (Windows), then take the path relative to the base,
        // path.relative ignores case on Windows, where the drive letter case can differ
        const filename = f.getFilename().replace(/^[\\/]{2}\?[\\/]/, "");
        const n = outputFolder + path.posix.sep + FileOperations.toUnixPath(path.relative(myBase, filename));
        console.log("Write " + n);
        fs.mkdirSync(path.dirname(n), {recursive: true});
        fs.writeFileSync(n, f.getRaw());
      }
    }
  }

  private rename(rconfig: abaplint.IRenameSettings, quiet?: boolean): abaplint.Rename {
    const renames = this.findRenames(rconfig);
    this.checkLengths(renames);

    const renamer = new abaplint.Rename(this.reg);
    for (const r of renames) {
      if (quiet !== true) {
        console.log("Renaming " + r.type + " " + r.oldName.padEnd(30, " ") + " -> " + r.newName);
      }

      const result = renamer.rename(r.type, r.oldName, r.newName);
      result.updatedFiles.forEach(f => { this.updatedFiles.add(f); });
      result.deletedFiles.forEach(f => { this.deletedFiles.add(f); });
      result.addedFiles.forEach(f => { this.addedFiles.add(f); });
    }
    return renamer;
  }

  /** the objects to rename, each with the first pattern that matches it */
  private findRenames(rconfig: abaplint.IRenameSettings): IRename[] {
    const renames: IRename[] = [];
    for (const o of this.reg.getObjects()) {
      if (this.reg.isDependency(o) === true) {
        continue;
      }
      for (const p of rconfig.patterns || []) {
        if (!o.getType().match(p.type)) {
          continue;
        }
        const regex = new RegExp(p.oldName, "i");
        if (!regex.exec(o.getName())) {
          continue;
        }
        renames.push({
          type: o.getType(),
          oldName: o.getName(),
          newName: o.getName().replace(regex, p.newName),
          maxLength: o.getAllowedNaming().maxLength,
        });
        break;
      }
    }
    return renames;
  }

  /** Nothing is renamed if a new name is too long, and the error lists all of them: a pattern
   *  that adds characters typically pushes several names over the limit, not one */
  private checkLengths(renames: IRename[]) {
    const tooLong = renames.filter(r => r.newName.length > r.maxLength);
    if (tooLong.length > 0) {
      throw new Error("Name not allowed, " + tooLong.length + " new name(s) too long:\n" + tooLong.map(r =>
        "  " + r.type + " " + r.oldName + " -> " + r.newName + ", " + r.newName.length +
        " characters, at most " + r.maxLength).join("\n"));
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