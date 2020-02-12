import {LanguageServer} from "abaplint/lsp/language_server";
import {FileSystem} from "../filesystem";
import * as monaco from "monaco-editor";

export class ABAPRenameProvider implements monaco.languages.RenameProvider {

  public provideRenameEdits(model: monaco.editor.ITextModel, position: monaco.Position, newName: string, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.WorkspaceEdit & monaco.languages.Rejection> {

// todo, apply the workspacedit to the model and FileSystem, probably wait for vscode-web
    throw new Error("provideRenameEdits, method not implemented");
  }

  public resolveRenameLocation(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken):
  monaco.languages.ProviderResult<monaco.languages.RenameLocation & monaco.languages.Rejection> {

    const ls = new LanguageServer(FileSystem.getRegistry());

    const rename = ls.prepareRename({
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