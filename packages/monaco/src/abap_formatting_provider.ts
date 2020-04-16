import {IRegistry, LanguageServer} from "@abaplint/core";

export class ABAPFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {

    const ls = new LanguageServer(this.reg);
    const edit = ls.documentFormatting({
      textDocument: {uri: model.uri.toString()},
    });

    if (edit && edit.length === 1) {
      return [{
        range: {
          startLineNumber: edit[0].range.start.line,
          startColumn: edit[0].range.start.character,
          endLineNumber: edit[0].range.end.line,
          endColumn: edit[0].range.end.character,
        },
        text: edit[0].newText,
      }];
    } else {
      return undefined;
    }
  }

}