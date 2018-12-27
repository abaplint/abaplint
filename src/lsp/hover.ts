import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {ABAPFile} from "../files";
import {Token} from "../abap/tokens/_token";
import {INode} from "../abap/nodes/_inode";
import {StructureNode, StatementNode, ExpressionNode, TokenNode} from "../abap/nodes";

export class Hover {
  public static find(reg: Registry, uri: string, line: number, character: number): LServer.MarkupContent | undefined {
    const file = reg.getABAPFile(uri);
    if (file === undefined) {
      return undefined;
    }

    let ret: LServer.MarkupContent | undefined = undefined;

    for (const statement of file.getStatements()) {
      for (const token of statement.getTokens()) {
// assumption: no tokens span multiple lines
        if (token.getRow() - 1 === line
            && token.getCol() - 1 <= character
            && token.getCol() - 1 + token.getStr().length > character) {
          let value =
            "```abap\n" + token.getStr() + "\n```\n" +
            "Statement: " + statement.get().constructor.name + "\n\n" +
            "Token: " + token.constructor.name;

          value = value + this.fullPath(file, token);

          ret = {kind: LServer.MarkupKind.Markdown, value};
          break;
        }
      }
      if (ret !== undefined) {
        break;
      }
    }

    return ret;
  }

  private static fullPath(file: ABAPFile, token: Token): string {
    const structure = file.getStructure();

    if (structure === undefined) {
      return "";
    }

    const found = this.traverse(structure, "", token);
    if (found === undefined) {
      return "";
    }

    return "\n\n" + found;
  }

  private static traverse(node: INode, parents: string, search: Token): string | undefined {
    let local = parents;
    if (local !== "") {
      local = local + " -> ";
    }
    if (node instanceof StructureNode) {
      local = local + "Structure: " + node.get().constructor.name;
    } else if (node instanceof StatementNode) {
      local = local + "Statement: " + node.get().constructor.name;
    } else if (node instanceof ExpressionNode) {
      local = local + "Expression: " + node.get().constructor.name;
    } else if (node instanceof TokenNode) {
      local = local + "Token: " + node.get().constructor.name;
      if (node.get() === search) {
        return local;
      }
    } else {
      throw new Error("hover, traverse, unexpected node type");
    }

    for (const child of node.getChildren()) {
      return this.traverse(child, local, search);
    }

    return undefined;
  }

}