import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";
import {PrettyPrinter} from "abaplint/abap/pretty_printer";

export class EditorWidget extends Widget {
  private editor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;
  private filename: string;
  private contents: string;

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor(filename: string, contents: string) {
    super({node: EditorWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("editor");
    this.title.label = filename;
    this.title.closable = true;
    this.title.caption = this.title.label;
    this.filename = filename;
    this.contents = contents;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
  }

  protected onResize() {
    if (this.editor) {
      this.editor.layout();
    }
  }

  protected onActivateRequest(msg: Message): void {
    if (this.editor) {
      this.editor.focus();
    }
  }

  protected determineLanguage(filename: string): string {
    const split = filename.split(".");
    return split[split.length - 1];
  }

  protected changed(e: any) {
    FileSystem.updateFile(this.filename, this.editor!.getValue());
    this.updateMarkers();
  }

  protected updateMarkers() {
    const issues = FileSystem.getIssues(this.filename);

    const markers: monaco.editor.IMarkerData[] = [];
    for (const i of issues) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: i.getMessage(),
        startLineNumber: i.getStart().getRow(),
        startColumn: i.getStart().getCol(),
        endLineNumber: i.getEnd().getRow(),
        endColumn: i.getEnd().getCol(),
      });
    }

    monaco.editor.setModelMarkers(this.editor!.getModel()!, "abaplint", markers);
  }

  protected prettyPrint() {
    const file = FileSystem.getRegistry().getABAPFile(this.filename);
    if (file === undefined) {
      return;
    }
    const old = this.editor!.getPosition();
    this.editor!.setValue(new PrettyPrinter(file).run());
    this.editor!.setPosition(old!);
  }

  protected onAfterAttach() {
    if (this.editor === undefined) {
      this.editor = monaco.editor.create(this.node, {
        value: this.contents,
        language: this.determineLanguage(this.filename),
        theme: "vs-dark",
        lightbulb: {
          enabled: true,
        },
      });

// hmm, cannot remap F1, see https://github.com/microsoft/monaco-editor/issues/649

      this.editor.onDidChangeModelContent(this.changed.bind(this));
      this.editor.addCommand(monaco.KeyMod.Shift + monaco.KeyCode.F1, this.prettyPrint.bind(this));
      this.editor.addCommand(
        monaco.KeyMod.CtrlCmd + monaco.KeyMod.Shift + monaco.KeyCode.KEY_P,
        () => { this.editor!.trigger("", "editor.action.quickCommand", ""); });
      this.editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.KEY_S, () => { return undefined; });
      this.updateMarkers();
    }
  }
}