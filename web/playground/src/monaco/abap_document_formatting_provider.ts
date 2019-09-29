import * as monaco from "monaco-editor";

export class ABAPDocumentFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {

  public provideDocumentFormattingEdits(
      model: monaco.editor.ITextModel,
      options: monaco.languages.FormattingOptions,
      token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
    console.dir("formatting");
    throw new Error("Method not implemented.");
  }

}

/*
  protected prettyPrint() {
    const file = FileSystem.getRegistry().getABAPFile(this.filename);
    if (file === undefined) {
      return;
    }
    const old = this.editor!.getPosition();
    this.editor!.setValue(new PrettyPrinter(file).run());
    this.editor!.setPosition(old!);
  }
*/