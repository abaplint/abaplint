import {IRegistry, LanguageServer} from "@abaplint/core";
import {TextDocumentEdit} from "vscode-languageserver-types";

export class ABAPRenameProvider implements monaco.languages.RenameProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideRenameEdits(model: monaco.editor.ITextModel, position: monaco.Position, newName: string, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {

    const rename = new LanguageServer(this.reg).rename({
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1},
      newName});

    const edit: monaco.languages.WorkspaceEdit = {edits: []};
    for (const r of rename?.documentChanges ? rename?.documentChanges : []) {
      if (TextDocumentEdit.is(r)) {
        for (const e of r.edits) {
          const textedit: monaco.languages.TextEdit = {range: new monaco.Range(
            e.range.start.line + 1,
            e.range.start.character + 1,
            e.range.end.line + 1,
            e.range.end.character + 1), text: newName};
          const wte: monaco.languages.WorkspaceTextEdit = {resource: model.uri, edit: textedit};
          edit.edits.push(wte);
        }
      }
    }

    return edit;
  }

  public resolveRenameLocation(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.RenameLocation & monaco.languages.Rejection> {

    const rename = new LanguageServer(this.reg).prepareRename({
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}});

    if (rename) {
      return {
        range: new monaco.Range(
          rename.range.start.line + 1,
          rename.range.start.character + 1,
          rename.range.end.line + 1,
          rename.range.end.character + 1),
        text: rename.placeholder,
      };
    }

    throw new Error("Cannot be renamed");
  }

}