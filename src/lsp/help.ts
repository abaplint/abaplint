import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {INode} from "../abap/nodes/_inode";
import {ABAPFile} from "../files";
import {StructureNode, StatementNode} from "../abap/nodes";

// todo: refactor the functions into the class

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
// getting the class name only works if uglify does not mangle names
    output = output +
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

export class Help {
  public static find(reg: Registry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {
    let content = "";

    position.line = position.line + 1;
    position.character = position.character + 1;

    content = "<tt>" + textDocument.uri + " (" + position.line + ", " + position.character + ")</tt>";
    content = content + "<hr>";

    const file = reg.getABAPFile(textDocument.uri);
    if (file !== undefined) {
      content = content + tokens(file);
      content = content + "<hr>";

      content = content + buildStatements(file);
      content = content + "<hr>";

      const structure = file.getStructure();
      if (structure !== undefined) {
        content = content + buildStructure([structure]);
      } else {
        content = content + "sturcture undefined";
      }
    }

    return content;
  }
}