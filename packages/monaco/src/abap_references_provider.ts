import {IRegistry, LanguageServer} from "@abaplint/core";

export class ABAPReferencesProvider implements monaco.languages.ReferenceProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideReferences(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.ReferenceContext,
    token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Location[]> {

    const ls = new LanguageServer(this.reg);

    const pos = {
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}};

    const ret: monaco.languages.Location[] = [];

    for (const found of ls.references(pos)) {
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