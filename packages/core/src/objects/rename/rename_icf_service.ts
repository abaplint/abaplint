import {IRegistry} from "../../_iregistry";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {ICFService} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

export class RenameICFService implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof ICFService)) {
      throw new Error("RenameICFService, not a ICF Service");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "URL", oldName, newName, true));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ICF_NAME", oldName, newName));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ORIG_NAME", oldName, newName, true));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));
    return {
      documentChanges: changes,
    };
  }

}
