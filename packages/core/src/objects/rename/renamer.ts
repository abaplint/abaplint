import {RenameFile, TextDocumentEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {MemoryFile} from "../../files/memory_file";
import {IRegistry} from "../../_iregistry";
import {RenameGlobalClass} from "./rename_global_class";
import {ObjectRenamer} from "./_object_renamer";

export class Renamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  /** Applies the renaming to the objects and files in the registry,
   *  after renaming the registry is not parsed  */
  public rename(type: string, oldName: string, newName: string) {
    let r: ObjectRenamer | undefined = undefined;
    switch (type) {
      case "CLAS":
        r = new RenameGlobalClass(this.reg);
        break;
      default:
        throw new Error("Renaming of " + type + " not yet supported");
    }
    const edits = r.buildEdits(oldName.toUpperCase(), newName.toUpperCase());

    if (edits === undefined) {
      throw new Error("no changes could be determined");
    } else if (edits.changes) {
      throw new Error("only documentChanges expected");
    }

    this.apply(edits);
  }

//////////////////

  private apply(edits: WorkspaceEdit) {
    const renames: RenameFile[] = [];

    // assumption: only renames or text changes, no deletes or creates
    for (const dc of edits.documentChanges || []) {
      if (TextDocumentEdit.is(dc)) {
        this.applyEdit(dc);
      } else if (RenameFile.is(dc)) {
        renames.push(dc);
      } else {
        throw new Error("unexpected documentChange type");
      }
    }

    this.applyRenames(renames);
  }

  private applyEdit(dc: TextDocumentEdit) {
    const file = this.reg.getFileByName(dc.textDocument.uri);
    if (file === undefined) {
      throw new Error("file " + dc.textDocument.uri + " not found");
    }
    const rows = file.getRawRows();
    for (const e of dc.edits) {
      if (e.range.start.line !== e.range.end.line) {
        throw new Error("applyEdit, start and end line differ");
      }
      const before = rows[e.range.start.line];
      rows[e.range.start.line] = before.substring(0, e.range.start.character) +
        e.newText +
        before.substring(e.range.end.character);
    }
    const newFile = new MemoryFile(dc.textDocument.uri, rows.join("\n"));
    this.reg.updateFile(newFile);
  }

  private applyRenames(renames: RenameFile[]) {
    for (const r of renames) {
      const old = this.reg.getFileByName(r.oldUri);
      if (old === undefined) {
        throw new Error("applyRenames, old not found");
      }
      const newFile = new MemoryFile(r.newUri, old.getRaw());
      this.reg.removeFile(old);
      this.reg.addFile(newFile);
    }
  }
}