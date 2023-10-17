import {RenameFile, TextDocumentEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {MemoryFile} from "../../files/memory_file";
import {IRegistry} from "../../_iregistry";
import {RenameDataElement} from "./rename_data_element";
import {RenameDomain} from "./rename_domain";
import {RenameGlobalClass} from "./rename_global_class";
import {RenameGlobalInterface} from "./rename_global_interface";
import {RenameTable} from "./rename_table";
import {RenameTableType} from "./rename_table_type";
import {ObjectRenamer} from "./_object_renamer";
import {RenameMessageClass} from "./rename_message_class";

export interface IRenameResult {
  deletedFiles: Set<string>;
  addedFiles: Set<string>;
  updatedFiles: Set<string>;
}

export class Renamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  /** Applies the renaming to the objects and files in the registry,
   *  after renaming the registry is not parsed */
  public rename(type: string, oldName: string, newName: string): IRenameResult {
    const edits = this.buildEdits(type, oldName, newName);

    if (edits === undefined) {
      throw new Error("no changes could be determined");
    } else if (edits.changes) {
      throw new Error("only documentChanges expected");
    }

    const result = this.apply(edits);
    this.reg.findIssues(); // hmm, this builds the ddic references
    return result;
  }

  /** Builds edits, but does not apply to registry, used by LSP */
  public buildEdits(type: string, oldName: string, newName: string): WorkspaceEdit | undefined {
    this.reg.parse(); // the registry must be parsed to dermine references

    const obj = this.reg.getObject(type, oldName);
    if (obj === undefined) {
      throw new Error("rename, object not found");
    } else if (newName.length > obj.getAllowedNaming().maxLength) {
      // todo, also do not allow strange characters and spaces
      throw new Error("Name not allowed");
    }

    const r = this.factory(type);

    return r.buildEdits(obj, oldName.toUpperCase(), newName);
  }

//////////////////

  private factory(type: string): ObjectRenamer {
    switch (type) {
      case "CLAS":
        return new RenameGlobalClass(this.reg);
      case "DTEL":
        return new RenameDataElement(this.reg);
      case "DOMA":
        return new RenameDomain(this.reg);
      case "TABL":
        return new RenameTable(this.reg);
      case "TTYP":
        return new RenameTableType(this.reg);
      case "INTF":
        return new RenameGlobalInterface(this.reg);
      case "MSAG":
        return new RenameMessageClass(this.reg);
      default:
        throw new Error("Renaming of " + type + " not yet supported");
    }
  }

  private apply(edits: WorkspaceEdit): IRenameResult {
    const renames: RenameFile[] = [];

    const result: IRenameResult = {
      addedFiles: new Set<string>(),
      deletedFiles: new Set<string>(),
      updatedFiles: new Set<string>(),
    };

    // assumption: only renames or text changes, no deletes or creates
    for (const dc of edits.documentChanges || []) {
      if (TextDocumentEdit.is(dc)) {
        this.applyEdit(dc);
        result.updatedFiles.add(dc.textDocument.uri);
      } else if (RenameFile.is(dc)) {
        renames.push(dc);
      } else {
        throw new Error("unexpected documentChange type");
      }
    }

    for (const rename of renames) {
      result.updatedFiles.delete(rename.oldUri);
      result.deletedFiles.add(rename.oldUri);
      result.addedFiles.add(rename.newUri);
    }

    this.applyRenames(renames);

    return result;
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