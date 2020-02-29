import * as monaco from "monaco-editor";
import {Widget, DockPanel} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";
import {LanguageServer} from "abaplint/lsp/language_server";
import * as LServer from "vscode-languageserver-types";
import {EditorWidget} from ".";

export class HelpWidget extends Widget {

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  public static getInstance(editor: EditorWidget): HelpWidget {
    const dock = editor.parent as DockPanel;
    const it = dock.children();
    for (;;) {
      const res = it.next();
      if (res === undefined) {
        break;
      } else if (res instanceof HelpWidget) {
        return res;
      }
    }

    const help = new HelpWidget();
    dock.addWidget(help, {mode: "split-right", ref: editor});
    return help;
  }

  public constructor() {
    super({node: HelpWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.title.label = "Help";
    this.title.closable = true;
    this.title.caption = this.title.label;
  }

  public get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
  }

  public updateIt(filename: string, position: monaco.Position) {

    const content = document.createElement("div");
    this.addClass("help");

    content.innerHTML = new LanguageServer(FileSystem.getRegistry()).help(
      {uri: filename},
      LServer.Position.create(position.lineNumber - 1, position.column - 1));

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }

}