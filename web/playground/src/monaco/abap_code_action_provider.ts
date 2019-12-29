import * as monaco from "monaco-editor";

export class ABAPCodeActionProvider implements monaco.languages.CodeActionProvider {

  public provideCodeActions(model: monaco.editor.ITextModel,
                            range: monaco.Range,
                            context: monaco.languages.CodeActionContext,
                            token: monaco.CancellationToken):
                            monaco.languages.CodeActionList | Promise<monaco.languages.CodeActionList> {
    const list: monaco.languages.CodeActionList = {
      actions: [],
      dispose: () => { return; }};
    return list;
  }

}
