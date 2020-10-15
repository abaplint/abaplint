import {WorkspaceEdit} from "vscode-languageserver-types";
import {IObject} from "../_iobject";

export interface ObjectRenamer {
  buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined;
}