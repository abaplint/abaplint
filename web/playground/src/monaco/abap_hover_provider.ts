import * as monaco from "monaco-editor";
// import {LanguageServer} from "abaplint/lsp";
// import {FileSystem} from "../filesystem";

export class ABAPHoverProvider implements monaco.languages.HoverProvider {

  public provideHover(model: monaco.editor.ITextModel, position: monaco.Position): monaco.languages.ProviderResult<monaco.languages.Hover> {
    /*
    const ls = new LanguageServer(FileSystem.getRegistry());
    const hov = ls.hover({
      textDocument: {uri: "zfoobar.prog.abap"},
      position: {line: 1, character: 1}}); // todo
    if (hov) {
      return {
        range: new monaco.Range(1, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount())),
        contents: [{value: "foo"}, {value: "bar"}],
      };
    } else {
      return undefined;
    }
    */
    return undefined;
  }

}