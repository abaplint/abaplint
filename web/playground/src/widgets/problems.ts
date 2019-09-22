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

  constructor() {
    super({node: ProblemsWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
  }

  protected onActivateRequest(msg: Message): void {
    return;
  }

  public update() {
    const content = document.createElement("div");
    this.addClass("content");
    const input = document.createElement("tt");
    for (const i of FileSystem.getIssues()) {
      const position = "[" + i.getStart().getRow() + ", " + i.getStart().getCol() + "]";
      input.innerHTML = input.innerHTML + "<br>" +
        i.getFile().getFilename() + position + ": " + i.getMessage() + "(" + i.getKey() + ")";
    }
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}