import {Message} from "@phosphor/messaging";
import {Widget} from "@phosphor/widgets";

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
}