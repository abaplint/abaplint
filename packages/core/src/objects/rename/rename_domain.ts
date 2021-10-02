import {IRegistry} from "../../_iregistry";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {Domain} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

export class RenameDomain implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof Domain)) {
      throw new Error("RenameDomain, not a domain");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "DOMNAME", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));
    changes = changes.concat(helper.renameDDICDTELReferences(obj, oldName, newName));

    return {
      documentChanges: changes,
    };
  }

}