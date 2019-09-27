import * as monaco from "monaco-editor";
import {Widget} from "@phosphor/widgets";
import {ABAPFile} from "abaplint/files";
import {FileSystem} from "../filesystem";
import {INode} from "abaplint/abap/nodes/_inode";
import {StructureNode, StatementNode} from "abaplint/abap/nodes";

function escape(str: string) {
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#039;");
  return str;
}

function linkToStatement(statement: any) {
  return `<a href="https://syntax.abaplint.org/#/statement/${statement.constructor.name}"
            target="_blank">${statement.constructor.name}</a>`;
}

function linkToStructure(structure: any) {
  return `<a href="https://syntax.abaplint.org/#/structure/${structure.constructor.name}"
             target="_blank">${structure.constructor.name}</a>`;
}

function linkToExpression(expression: any) {
  return `<a href="https://syntax.abaplint.org/#/expression/${expression.constructor.name}"
             target="_blank">${expression.constructor.name}</a>`;
}

function outputNodes(nodes: INode[]) {
  let ret = "<ul>";
  for (const node of nodes) {
    let extra = "";
    switch (node.constructor.name) {
      case "TokenNode":
        extra = node.get().constructor.name + ", \"" + node.get().getStr() + "\"";
        break;
      case "ExpressionNode":
        extra = linkToExpression(node.get()) + outputNodes(node.getChildren());
        break;
      default:
        break;
    }

    ret = ret + "<li>" + node.constructor.name + ", " + extra + "</li>";
  }
  return ret + "</ul>";
}

function tokens(file: ABAPFile) {
  let inner = "<table><tr><td><b>String</b></td><td><b>Type</b></td><td><b>Row</b></td><td><b>Column</b></td></tr>";
  for (const token of file.getTokens()) {
    inner = inner + "<tr><td>\"" +
      escape(token.getStr()) + "\"</td><td>" +
      token.constructor.name + "</td><td align=\"right\">" +
      token.getRow() + "</td><td align=\"right\">" +
      token.getCol() + "</td></tr>";
  }
  inner = inner + "</table>";
  return inner;
}

function buildStatements(file: ABAPFile) {
  let output = "";

  for (const statement of file.getStatements()) {
    const row = statement.getStart().getRow();
    const col = statement.getStart().getCol();
    const erow = statement.getEnd().getRow();
    const ecol = statement.getEnd().getCol();
// getting the class name only works if uglify does not mangle names
    output = output +
      "<b><div onmouseover=\"javascript:markLine(" +
      row + ", " + col + ", " + erow + ", " + ecol + ");\">" +
      row + ": " +
      linkToStatement(statement.get()) +
      "</div></b>\n" + outputNodes(statement.getChildren());
  }

  return output;
}

function buildStructure(nodes: INode[]) {
  let output = "<ul>";
  for (const node of nodes) {
    if (node instanceof StructureNode) {
      output = output + "<li>" + linkToStructure(node.get()) + ", Structure " + buildStructure(node.getChildren()) + "</li>";
    } else if (node instanceof StatementNode) {
      output = output + "<li>" + linkToStatement(node.get()) + ", Statement</li>";
    }
  }
  return output + "</ul>";
}

// ***************************************

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
    content.innerHTML = "<tt>" + filename + " " + position.toString() + "</tt>";
    content.innerHTML = content.innerHTML + "<hr>";

    const file = FileSystem.getRegistry().getABAPFile(filename);
    if (file !== undefined) {
      content.innerHTML = content.innerHTML + tokens(file);
      content.innerHTML = content.innerHTML + "<hr>";

      content.innerHTML = content.innerHTML + buildStatements(file);
      content.innerHTML = content.innerHTML + "<hr>";

      const structure = file.getStructure();
      if (structure !== undefined) {
        content.innerHTML = content.innerHTML + buildStructure([structure]);
      } else {
        content.innerHTML = content.innerHTML + "sturcture undefined";
      }
    }

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }

}