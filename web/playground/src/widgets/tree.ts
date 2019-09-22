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
    const input = document.createElement("tt");
// todo: sort by name
    for (const f of FileSystem.getFiles()) {
      input.innerHTML = input.innerHTML + "<br>" + f.getFilename();
    }
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}