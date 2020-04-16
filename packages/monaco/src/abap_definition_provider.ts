import {IRegistry, LanguageServer} from "@abaplint/core";

export class ABAPDefinitionProvider implements monaco.languages.DefinitionProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideDefinition(model: monaco.editor.ITextModel,
                           position: monaco.Position,
                           token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Definition> {

    const ls = new LanguageServer(this.reg);
    const def = ls.gotoDefinition({
      textDocument: {uri: model.uri.toString()},
      position: {line: position.lineNumber - 1, character: position.column - 1}});
    if (def) {
      return {
        uri: monaco.Uri.parse(def.uri),
        range: new monaco.Range(
          def.range.start.line + 1,
          def.range.start.character + 1,
          def.range.end.line + 1,
          def.range.end.character + 1),
      };
    } else {
      return undefined;
    }

  }

}