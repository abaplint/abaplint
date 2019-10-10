import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {INode} from "../abap/nodes/_inode";
import {ABAPFile} from "../files";
import {StructureNode, StatementNode, TokenNodeRegex, ExpressionNode, TokenNode} from "../abap/nodes";
import {Token} from "../abap/tokens/_token";
import {LSPUtils} from "./_lsp_utils";
import {CheckVariablesLogic} from "../abap/syntax/check_variables";
import {ABAPObject} from "../objects/_abap_object";
import {ScopedVariables} from "../abap/syntax/_scoped_variables";

export class Help {
  public static find(reg: Registry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {
    let content = "";

    content = "<tt>" + textDocument.uri + " (" +
      (position.line + 1) + ", " +
      (position.character + 1) + ")</tt>";
    const file = reg.getABAPFile(textDocument.uri);
    if (file === undefined) {
      return content + "file not found";
    }

    content = content + "<hr>";
    content = content + this.cursorInformation(reg, textDocument, position, file);
    content = content + this.fileInformation(file);

    return content;
  }

  private static cursorInformation(reg: Registry,
                                   textDocument: LServer.TextDocumentIdentifier,
                                   position: LServer.Position,
                                   file: ABAPFile): string {
    let ret = "";
    const found = LSPUtils.find(reg, textDocument, position);

    if (found !== undefined) {
      ret = "Statement: " + this.linkToStatement(found.statement) + "<br>\n" +
        "Token: " + found.token.constructor.name + "<br>\n" +
        this.fullPath(file, found.token).value;

      const obj = reg.getObject(file.getObjectType(), file.getObjectName());
      if (obj instanceof ABAPObject) {
        const variables = new CheckVariablesLogic(reg, obj).traverseUntil(found.token);
        ret = ret + this.dumpVariables(variables);
      }
    } else {
      ret = "No token found";
    }

    return ret;
  }

  private static dumpVariables(variables: ScopedVariables): string {
    let ret = "<hr>\n";
    for (const s of variables.get()) {
      if (s.name === "_builtin") {
        continue; // too many of these, and they are not super important right now
      }
      ret = ret + "<u>" + s.name + "</u>: ";
      for (const v of s.vars) {
        ret = ret + "<tt>" + v.name.toLowerCase() + "</tt>";
        if (v.identifier !== undefined) {
          const pos = v.identifier.getStart();
          ret = ret + "(" + pos.getRow() + ", " + pos.getCol() + ")";
        }
        ret = ret + ", ";
      }
      ret = ret + "<br>\n";
    }
    return ret;
  }

  private static fullPath(file: ABAPFile, token: Token): {value: string, keyword: boolean}  {
    const structure = file.getStructure();

    if (structure === undefined) {
      return {value: "", keyword: false};
    }

    const found = this.traverse(structure, "", token);
    if (found === undefined) {
      return {value: "", keyword: false};
    }

    return {value: "\n\n" + found.value, keyword: found.keyword};
  }

  private static traverse(node: INode, parents: string, search: Token): {value: string, keyword: boolean} | undefined {
    let local = parents;
    if (local !== "") {
      local = local + " -> ";
    }
    if (node instanceof StructureNode) {
      local = local + "Structure: " + this.linkToStructure(node.get());
    } else if (node instanceof StatementNode) {
      local = local + "Statement: " + this.linkToStatement(node.get());
    } else if (node instanceof ExpressionNode) {
      local = local + "Expression: " + this.linkToExpression(node.get());
    } else if (node instanceof TokenNode) {
      local = local + "Token: " + node.get().constructor.name;
      const token = node.get();
      if (token.getStr() === search.getStr()
          && token.getCol() === search.getCol()
          && token.getRow() === search.getRow()) {
        const keyword = !(node instanceof TokenNodeRegex);
        return {value: local, keyword};
      }
    } else {
      throw new Error("hover, traverse, unexpected node type");
    }

    for (const child of node.getChildren()) {
      const ret = this.traverse(child, local, search);
      if (ret) {
        return ret;
      }
    }

    return undefined;
  }

  private static fileInformation(file: ABAPFile): string {
    let content = "";

    content = content + "<hr>";
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
    return `<a href="https://syntax.abaplint.org/#/statement/${statement.constructor.name}" target="_blank">${statement.constructor.name}</a>\n`;
  }

  private static linkToStructure(structure: any) {
    return `<a href="https://syntax.abaplint.org/#/structure/${structure.constructor.name}" target="_blank">${structure.constructor.name}</a>\n`;
  }

  private static linkToExpression(expression: any) {
    return `<a href="https://syntax.abaplint.org/#/expression/${expression.constructor.name}" target="_blank">${expression.constructor.name}</a>\n`;
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
      inner = inner + "<tr><td><tt>" +
        this.escape(token.getStr()) + "</tt></td><td>" +
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