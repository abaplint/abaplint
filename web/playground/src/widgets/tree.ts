import * as monaco from "monaco-editor";
import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";
import {FileSystem} from "../filesystem";

export class TreeWidget extends Widget {
  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor() {
    super({node: TreeWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
  }

  public notify(): void {
    this.update();
  }

  protected onActivateRequest(msg: Message): void {
    return;
  }

  protected onAfterAttach() {
    this.update();
  }

  public update() {
    const content = document.createElement("div");
    this.addClass("content");
    const list = document.createElement("ul");
    const files = FileSystem.getFiles().map((f) => { return monaco.Uri.parse(f.getFilename()).path; }).sort();

    for (const f of files) {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(f));
      list.append(li);
    }
    content.appendChild(list);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}