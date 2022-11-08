import {IRegistry} from "../_iregistry";
import {Token} from "../abap/1_lexer/tokens/_token";
import {StatementNode, TokenNode} from "../abap/nodes";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ABAPObject} from "../objects/_abap_object";
import {ITextDocumentPositionParams} from "./_interfaces";
import {INode} from "../abap/nodes/_inode";
import {Position} from "../position";
import * as LServer from "vscode-languageserver-types";
import {ABAPFile} from "../abap/abap_file";

export interface ICursorData {
  token: Token;
  identifier: Identifier;
  stack: INode[];
  snode: StatementNode;
}

export class LSPUtils {

  public static getABAPFile(reg: IRegistry, filename: string): ABAPFile | undefined {

    const file = reg.getFileByName(filename);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.findObjectForFile(file);
    obj?.parse();

    if (obj instanceof ABAPObject) {
      for (const abapfile of obj.getABAPFiles()) {
        if (abapfile.getFilename().toUpperCase() === filename.toUpperCase()) {
          return abapfile;
        }
      }
    }

    return undefined;
  }

  public static tokenToRange(token: Token): LServer.Range {
    return LServer.Range.create(
      token.getStart().getRow() - 1,
      token.getStart().getCol() - 1,
      token.getEnd().getRow() - 1,
      token.getEnd().getCol() - 1);
  }

  public static identiferToLocation(identifier: Identifier): LServer.Location {
    return {
      uri: identifier.getFilename(),
      range: LSPUtils.tokenToRange(identifier.getToken()),
    };
  }

  public static findCursor(reg: IRegistry, pos: ITextDocumentPositionParams): ICursorData | undefined {
    const file = LSPUtils.getABAPFile(reg, pos.textDocument.uri);
    if (file === undefined) {
      return undefined;
    }

    const search = new Position(pos.position.line + 1, pos.position.character + 1);

    for (const statement of file.getStatements()) {
      const res = this.buildStack(statement, search, [statement]);
      if (res !== undefined) {
        return {
          token: res.token,
          identifier: new Identifier(res.token, file.getFilename()),
          stack: res.stack,
          snode: statement};
      }
    }

    return undefined;
  }

  private static buildStack(node: INode, search: Position, parents: INode[]): {token: Token, stack: INode[]} | undefined {
    const stack: INode[] = parents;

    for (const c of node.getChildren()) {
      if (c instanceof TokenNode) {
        const token = c.getFirstToken();
        if (token.getRow() === search.getRow()
            && token.getCol() <= search.getCol()
            && token.getCol() + token.getStr().length > search.getCol()) {
          return {token, stack};
        }
      } else {
        const res = this.buildStack(c, search, stack.concat([c]));
        if (res !== undefined) {
          return res;
        }
      }
    }

    return undefined;
  }

}