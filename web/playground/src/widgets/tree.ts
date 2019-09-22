import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";
import {FileSystem, IFileSubscriber} from "../filesystem";

export class TreeWidget extends Widget implements IFileSubscriber {
  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor() {
    super({node: TreeWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
    FileSystem.register(this);
  }

  public notify(): void {
    this.updateList();
  }

  protected onActivateRequest(msg: Message): void {
    return;
  }

  protected onAfterAttach() {
    this.updateList();
  }

  private updateList() {
    const content = document.createElement("div");
    this.addClass("content");
    const input = document.createElement("tt");
    for (const f of FileSystem.getFiles()) {
      input.innerHTML = input.innerHTML + "<br>" + f.filename;
    }
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}