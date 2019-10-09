import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {INode} from "../abap/nodes/_inode";
import {ABAPFile} from "../files";
import {StructureNode, StatementNode} from "../abap/nodes";

export class Help {
  public static find(reg: Registry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {
    let content = "";

    position.line = position.line + 1;
    position.character = position.character + 1;

    content = "<tt>" + textDocument.uri + " (" + position.line + ", " + position.character + ")</tt>";
    content = content + "<hr>";

    const file = reg.getABAPFile(textDocument.uri);
    if (file !== undefined) {
      content = content + this.tokens(file);
      content = content + "<hr>";

      content = content + this.buildStatements(file);
      content = content + "<hr>";

      const structure = file.getStructure();
      if (structure !== undefined) {
        content = content + this.buildStructure([structure]);
      } else {
        content = content + "sturcture undefined";
      }
    } else {
      content = content + "file not found";
    }

    return content;
  }

  private static escape(str: string) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
  }

  private static linkToStatement(statement: any) {
    return `<a href="https://syntax.abaplint.org/#/statement/${statement.constructor.name}"
              target="_blank">${statement.constructor.name}</a>`;
  }

  private static linkToStructure(structure: any) {
    return `<a href="https://syntax.abaplint.org/#/structure/${structure.constructor.name}"
               target="_blank">${structure.constructor.name}</a>`;
  }

  private static linkToExpression(expression: any) {
    return `<a href="https://syntax.abaplint.org/#/expression/${expression.constructor.name}"
               target="_blank">${expression.constructor.name}</a>`;
  }

  private static outputNodes(nodes: INode[]) {
    let ret = "<ul>";
    for (const node of nodes) {
      let extra = "";
      switch (node.constructor.name) {
        case "TokenNode":
          extra = node.get().constructor.name + ", \"" + node.get().getStr() + "\"";
          break;
        case "ExpressionNode":
          extra = this.linkToExpression(node.get()) + this.outputNodes(node.getChildren());
          break;
        default:
          break;
      }

      ret = ret + "<li>" + node.constructor.name + ", " + extra + "</li>";
    }
    return ret + "</ul>";
  }

  private static tokens(file: ABAPFile) {
    let inner = "<table><tr><td><b>String</b></td><td><b>Type</b></td><td><b>Row</b></td><td><b>Column</b></td></tr>";
    for (const token of file.getTokens()) {
      inner = inner + "<tr><td>\"" +
        this.escape(token.getStr()) + "\"</td><td>" +
        token.constructor.name + "</td><td align=\"right\">" +
        token.getRow() + "</td><td align=\"right\">" +
        token.getCol() + "</td></tr>";
    }
    inner = inner + "</table>";
    return inner;
  }

  private static buildStatements(file: ABAPFile) {
    let output = "";

    for (const statement of file.getStatements()) {
      const row = statement.getStart().getRow();
  // getting the class name only works if uglify does not mangle names
      output = output +
        row + ": " +
        this.linkToStatement(statement.get()) +
        "</div></b>\n" + this.outputNodes(statement.getChildren());
    }

    return output;
  }

  private static buildStructure(nodes: INode[]) {
    let output = "<ul>";
    for (const node of nodes) {
      if (node instanceof StructureNode) {
        output = output + "<li>" + this.linkToStructure(node.get()) + ", Structure " + this.buildStructure(node.getChildren()) + "</li>";
      } else if (node instanceof StatementNode) {
        output = output + "<li>" + this.linkToStatement(node.get()) + ", Statement</li>";
      }
    }
    return output + "</ul>";
  }

}