import * as monaco from "monaco-editor";

export class ABAPDocumentHighlightProvider implements monaco.languages.DocumentHighlightProvider {

  public provideDocumentHighlights(model: monaco.editor.ITextModel,
                                   position: monaco.Position,
                                   token: monaco.CancellationToken):
                                   monaco.languages.ProviderResult<monaco.languages.DocumentHighlight[]> {

// todo
    return undefined;
  }

}