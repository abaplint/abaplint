import * as monaco from "monaco-editor";
import {LanguageServer} from "abaplint/lsp";
import {FileSystem} from "./filesystem";
import {Range} from "vscode-languageserver-types";

export class HighlightActions {
  private definitions: string[];
  private reads: string[];
  private writes: string[];
  private readonly editor: monaco.editor.IStandaloneCodeEditor;

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.definitions = [];
    this.reads = [];
    this.writes = [];
  }

  public register() {
    this.editor.addAction({
      id: "abaplint.highlight.definitions",
      label: "ABAP Toggle Highlight Definitions",
      keybindings: [],
      precondition: "editorLangId == 'abap'",
      run: this.definition.bind(this),
    });
    this.editor.addAction({
      id: "abaplint.highlight.reads",
      label: "ABAP Toggle Highlight Reads",
      keybindings: [],
      precondition: "editorLangId == 'abap'",
      run: this.read.bind(this),
    });
    this.editor.addAction({
      id: "abaplint.highlight.writes",
      label: "ABAP Toggle Highlight Writes",
      keybindings: [],
      precondition: "editorLangId == 'abap'",
      run: this.write.bind(this),
    });
  }

  public definition() {
    if (this.definitions.length > 0) {
      this.editor!.deltaDecorations(this.definitions, []);
      this.definitions = [];
      return;
    }
    const ls = new LanguageServer(FileSystem.getRegistry());
    const found = ls.listDefinitionPositions({uri: this.editor.getModel()!.uri.toString()});
    const add = this.buildDecorations(found, "abapHighlightDefinitions");
    this.definitions = this.editor!.deltaDecorations([], add);
  }

  public read() {
    if (this.reads.length > 0) {
      this.editor!.deltaDecorations(this.reads, []);
      this.reads = [];
      return;
    }
    const ls = new LanguageServer(FileSystem.getRegistry());
    const found = ls.listDefinitionPositions({uri: this.editor.getModel()!.uri.toString()});
    const add = this.buildDecorations(found, "abapHighlightReads");
    this.reads = this.editor!.deltaDecorations([], add);
  }

  public write() {
    if (this.writes.length > 0) {
      this.editor!.deltaDecorations(this.writes, []);
      this.writes = [];
      return;
    }
    const ls = new LanguageServer(FileSystem.getRegistry());
    const found = ls.listDefinitionPositions({uri: this.editor.getModel()!.uri.toString()});
    const add = this.buildDecorations(found, "abapHighlightWrites");
    this.writes = this.editor!.deltaDecorations([], add);
  }

  private buildDecorations(ranges: Range[], inlineClassName: string): monaco.editor.IModelDeltaDecoration[] {
    const add: monaco.editor.IModelDeltaDecoration[] = [];
    for (const f of ranges) {
      add.push({
        range: new monaco.Range(
          f.start.line + 1,
          f.start.character + 1,
          f.end.line + 1,
          f.end.character + 1),
        options: {inlineClassName},
      });
    }
    return add;
  }

}