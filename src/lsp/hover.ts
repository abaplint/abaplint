import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {ABAPFile} from "../files";
import {Token} from "../abap/tokens/_token";
import {INode} from "../abap/nodes/_inode";
import {StructureNode, StatementNode, ExpressionNode, TokenNode, TokenNodeRegex} from "../abap/nodes";
import {CheckVariablesLogic} from "../abap/syntax/check_variables";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {ABAPObject} from "../objects/_abap_object";

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

          const full = this.fullPath(file, token);
          value = value + full.value;

          if (full.keyword === true) {
            value = value + "\n\nIs a ABAP keyword";
          } else {
            const obj = reg.getObject(file.getObjectType(), file.getObjectName());
            if (obj instanceof ABAPObject) {
              const resolved = new CheckVariablesLogic(reg, obj).resolveToken(token);
              if (resolved === undefined) {
                value = value + "\n\nNot resolved";
              } else if (resolved instanceof TypedIdentifier) {
                value = value + "\n\nResolved: Local";
              }
            } else {
              value = value + "\n\nNot an ABAP object.";
            }
          }

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
      local = local + "Structure: " + node.get().constructor.name;
    } else if (node instanceof StatementNode) {
      local = local + "Statement: " + node.get().constructor.name;
    } else if (node instanceof ExpressionNode) {
      local = local + "Expression: " + node.get().constructor.name;
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

}