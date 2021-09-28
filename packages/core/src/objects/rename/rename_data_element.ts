import {WorkspaceEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {DataElement} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";

export class RenameDataElement implements ObjectRenamer {
//  private readonly reg: IRegistry;

  public constructor(_reg: IRegistry) {
//    this.reg = reg;
  }

  public buildEdits(obj: IObject, _oldName: string, _newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof DataElement)) {
      throw new Error("not a data element");
    }

    return {
      documentChanges: [],
    };
  }

}