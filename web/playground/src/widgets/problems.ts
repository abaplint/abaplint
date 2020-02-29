import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";

export class ProblemsWidget extends Widget {

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    const content = document.createElement("div");
    const input = document.createElement("tt");
    input.innerText = "problems";
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  public constructor() {
    super({node: ProblemsWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
  }

  protected onActivateRequest(msg: Message): void {
    return;
  }

  private escape(str: string) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
  }

  public updateIt() {
    const content = document.createElement("div");
    this.addClass("content");
    const input = document.createElement("tt");
    for (const i of FileSystem.getIssues()) {
      const position = "[" + i.getStart().getRow() + ", " + i.getStart().getCol() + "]";
      const path = monaco.Uri.parse(i.getFilename()).path;
      const message = this.escape(i.getMessage());
      input.innerHTML = input.innerHTML + "<br>" +
        path + position + ": " + message + "(" + i.getKey() + ")";
    }
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}