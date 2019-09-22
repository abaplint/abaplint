import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";

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

  protected onAfterAttach() {
    if (this.editor === undefined) {
      this.editor = monaco.editor.create(this.node, {
        value: this.contents,
        language: this.determineLanguage(this.filename),
        theme: "vs-dark",
        glyphMargin: true,
        lightbulb: {
          enabled: true,
        },
      });
    }
  }
}