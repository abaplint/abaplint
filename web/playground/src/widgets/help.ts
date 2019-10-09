import * as monaco from "monaco-editor";
import {Widget} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";
import {LanguageServer} from "abaplint/lsp";
import * as LServer from "vscode-languageserver-types";

export class HelpWidget extends Widget {

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor() {
    super({node: HelpWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.title.label = "Help";
    this.title.closable = true;
    this.title.caption = this.title.label;
  }

  get inputNode(): HTMLInputElement {
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