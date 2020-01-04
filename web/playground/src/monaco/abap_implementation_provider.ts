import {LanguageServer} from "abaplint/lsp";
import {FileSystem} from "../filesystem";
import * as monaco from "monaco-editor";

export class ABAPImplementationProvider implements monaco.languages.ImplementationProvider {

  public provideImplementation(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      _token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Location[]> {

    const ls = new LanguageServer(FileSystem.getRegistry());

    const pos = {
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}};

    const ret: monaco.languages.Location[] = [];

    for (const found of ls.implementation(pos)) {
      ret.push({
        uri: monaco.Uri.parse(found.uri),
        range: new monaco.Range(
          found.range.start.line + 1,
          found.range.start.character + 1,
          found.range.end.line + 1,
          found.range.end.character + 1),
      });
    }

    return ret;
  }

}