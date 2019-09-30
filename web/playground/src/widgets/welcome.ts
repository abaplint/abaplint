import {Widget} from "@phosphor/widgets";
import {Registry} from "abaplint/registry";
import * as logo from "../../public/img/abaplint.svg";

export class WelcomeWidget extends Widget {

  public static createNode(): HTMLElement {
    const node = document.createElement("div");
    return node;
  }

  constructor() {
    super({node: WelcomeWidget.createNode()});
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("welcome");
    this.title.label = "Welcome";
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
    <br>
    <img src="${logo}" style="filter: grayscale(100%);" height="200">
    <br>
    <br>
    Editor Shortcuts:<br>
    F1 = ABAP Help<br>
    Shift + F1 = Pretty Print<br>
    Ctrl + Shift + P = Command Palette<br>
    <br>
    abaplint ` + Registry.abaplintVersion() + `<br>
    <a href="https://github.com/abaplint/abaplint/tree/master/web/playground">playground sourcecode</a>
    </center>`;
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}