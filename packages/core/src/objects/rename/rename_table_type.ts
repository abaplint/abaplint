import {IRegistry} from "../../_iregistry";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {TableType} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

export class RenameTableType implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof TableType)) {
      throw new Error("RenameTableType, not a table type");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "TYPENAME", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));
    changes = changes.concat(helper.renameDDICCodeReferences(obj, oldName, newName));
    changes = changes.concat(helper.renameDDICTABLReferences(obj, oldName, newName));
    changes = changes.concat(helper.renameDDICTTYPReferences(obj, oldName, newName));

    return {
      documentChanges: changes,
    };
  }

}