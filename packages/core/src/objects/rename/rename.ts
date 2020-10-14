import {IRegistry} from "../../_iregistry";
import {RenameGlobalClass} from "./rename_global_class";
import {ObjectRenamer} from "./_object_renamer";

export class Rename {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public rename(type: string, oldName: string, newName: string) {
    let r: ObjectRenamer | undefined = undefined;
    switch (type) {
      case "CLAS":
        r = new RenameGlobalClass(this.reg);
        break;
      default:
        throw new Error("Renaming of " + type + " not yet supported");
    }

    const edits = r.buildEdits(oldName, newName);
    if (edits === undefined) {
      return;
    }

    // todo, apply
  }
}