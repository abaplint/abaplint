import {Widget} from "@phosphor/widgets";

// todo, this should be a singleton/only one window in the workspace
export class HelpWidget extends Widget {

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor() {
    super({node: HelpWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("help");
    this.title.label = "Help";
    this.title.closable = true;
    this.title.caption = this.title.label;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName("input")[0] as HTMLInputElement;
  }

  protected onAfterAttach() {
    const content = document.createElement("div");
    this.addClass("content");
    const input = document.createElement("tt");
    input.innerHTML = `
    <center>
    hello world, todo
    </center>`;
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}