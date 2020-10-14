import {WorkspaceEdit} from "vscode-languageserver-types";

export interface ObjectRenamer {
  buildEdits(oldName: string, newName: string): WorkspaceEdit | undefined;
}