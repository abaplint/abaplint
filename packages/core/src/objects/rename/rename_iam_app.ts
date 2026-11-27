import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {BusinessCatalogAppAssignment, IAMApp} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {RenamerHelper} from "./renamer_helper";
import {IObject} from "../_iobject";

/** IAM app (SIA6). The assignments to business catalogs (SIA7) follow */
export class RenameIAMApp implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof IAMApp)) {
      throw new Error("not an IAM app");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "NAME", oldName, newName));
    // the app itself, and the key of its service entries
    changes = changes.concat(helper.buildXMLFileEdits(obj, "APP_ID", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));

    for (const assignment of this.reg.getObjectsByType("SIA7")) {
      changes = changes.concat(
        helper.buildXMLFileEdits(assignment as BusinessCatalogAppAssignment, "APP_ID", oldName, newName));
    }

    return {
      documentChanges: changes,
    };
  }

}
