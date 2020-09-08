import * as LServer from "vscode-languageserver-types";
import {IEdit, ITextEdit} from "../edit_helper";

export class LSPEdit {
  public static mapEdits(edits: IEdit[]): LServer.WorkspaceEdit {
    const workspace: LServer.WorkspaceEdit = {changes: {}};
    for (const edit of edits) {
      for (const filename in edit) {
        if (workspace.changes![filename] === undefined) {
          workspace.changes![filename] = [];
        }
        workspace.changes![filename] = workspace.changes![filename].concat(this.mapText(edit[filename]));
      }
    }
    return workspace;
  }
/*
  public static mapEditsDocument(edit: IEdit): LServer.WorkspaceEdit {
    const workspace: LServer.WorkspaceEdit = {documentChanges: []};
    for (const filename in edit) {
      const doc: LServer.VersionedTextDocumentIdentifier = {uri: filename, version: 1};

      const e = LServer.TextDocumentEdit.create(doc, this.mapText(edit[filename]));
      workspace.documentChanges?.push(e);
    }
    // @ts-ignore
    console.dir(workspace.documentChanges![0].edits[0]);
    // @ts-ignore
    console.dir(workspace.documentChanges![0].edits[1]);
    return workspace;
  }
*/
  public static mapEdit(edit: IEdit): LServer.WorkspaceEdit {
    const workspace: LServer.WorkspaceEdit = {changes: {}};
    for (const filename in edit) {
      workspace.changes![filename] = this.mapText(edit[filename]);
    }
    return workspace;
  }

  private static mapText(edit: ITextEdit[]): LServer.TextEdit[] {
    const result: LServer.TextEdit[] = [];

    for (const e of edit) {
      const range = LServer.Range.create(
        e.range.start.getRow() - 1,
        e.range.start.getCol() - 1,
        e.range.end.getRow() - 1,
        e.range.end.getCol() - 1);

      result.push({range, newText: e.newText});
    }

    return result;
  }
}