import {CreateFile, RenameFile, TextDocumentEdit, WorkspaceEdit} from "vscode-languageserver-types";
import {MemoryFile} from "../../files/memory_file";
import {IRegistry} from "../../_iregistry";
import {RenameDataElement} from "./rename_data_element";
import {RenameDomain} from "./rename_domain";
import {RenameGlobalClass} from "./rename_global_class";
import {RenameGlobalInterface} from "./rename_global_interface";
import {RenameProgram} from "./rename_program";
import {RenameTable} from "./rename_table";
import {RenameTableType} from "./rename_table_type";
import {ObjectRenamer} from "./_object_renamer";
import {RenameMessageClass} from "./rename_message_class";
import {RenameICFService} from "./rename_icf_service";
import {IRenamedURL, RenameURLs} from "./rename_urls";
import {ICFService} from "../icf_service";
import {RenameBSPApplication} from "./rename_bsp_application";

export interface IRenameResult {
  deletedFiles: Set<string>;
  addedFiles: Set<string>;
  updatedFiles: Set<string>;
}

export class Renamer {
  private readonly reg: IRegistry;
  private readonly renamedURLs: IRenamedURL[] = [];

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

    const before = type === "SICF" ? this.findObject(type, oldName) : undefined;
    const oldURL = before instanceof ICFService ? before.getURL() : undefined;
    const oldXML = before?.getXMLFile()?.getFilename();

    const result = this.apply(edits);
    this.reg.findIssues(); // hmm, this builds the ddic references

    if (oldURL !== undefined && oldXML !== undefined) {
      this.rememberURL(edits, oldURL, oldXML);
    }
    return result;
  }

  /** Renames the old URLs of the ICF nodes renamed by this renamer in the pages of the BSP
   *  applications, see RenameURLs */
  public renameURLs(): IRenameResult {
    this.reg.parse();
    const result = this.apply(new RenameURLs(this.reg).buildEdits(this.renamedURLs));
    this.reg.parse();
    return result;
  }

  /** Builds edits, but does not apply to registry, used by LSP */
  public buildEdits(type: string, oldName: string, newName: string): WorkspaceEdit | undefined {
    this.reg.parse(); // the registry must be parsed to dermine references

    const obj = this.findObject(type, oldName);

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

  private findObject(type: string, name: string) {
    let obj = this.reg.getObject(type, name);
    if (obj === undefined && type === "SICF") {
      obj = Array.from(this.reg.getObjects()).find(o =>
        o.getType() === "SICF" && o.getName().toUpperCase().startsWith(name.toUpperCase() + " "));
    }
    return obj;
  }

  /** the new URL is the one in the XML file the old XML file was renamed to */
  private rememberURL(edits: WorkspaceEdit, oldURL: string, oldXML: string) {
    for (const dc of edits.documentChanges || []) {
      if (RenameFile.is(dc) && dc.oldUri === oldXML) {
        const newURL = this.reg.getFileByName(dc.newUri)?.getRaw().match(/<URL>([^<]*)<\/URL>/)?.[1];
        if (newURL !== undefined && newURL.toLowerCase() !== oldURL.toLowerCase()) {
          this.renamedURLs.push({oldURL, newURL});
        }
      }
    }
  }

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
      case "PROG":
        return new RenameProgram(this.reg);
      case "MSAG":
        return new RenameMessageClass(this.reg);
      case "SICF":
        return new RenameICFService(this.reg);
      case "WAPA":
        return new RenameBSPApplication(this.reg);
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

    // assumption: only renames, creates or text changes, no deletes. A created file starts empty,
    // its content is a text edit after the create
    for (const dc of edits.documentChanges || []) {
      if (TextDocumentEdit.is(dc)) {
        this.applyEdit(dc);
        if (result.addedFiles.has(dc.textDocument.uri) === false) {
          result.updatedFiles.add(dc.textDocument.uri);
        }
      } else if (CreateFile.is(dc)) {
        if (this.reg.getFileByName(dc.uri) !== undefined) {
          throw new Error("apply, file " + dc.uri + " already exists");
        }
        this.reg.addFile(new MemoryFile(dc.uri, ""));
        result.addedFiles.add(dc.uri);
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
      if ("newText" in e === false) {
        throw new Error("applyEdit, snippet edit not supported");
      }
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
