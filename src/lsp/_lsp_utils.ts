import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {Token} from "../abap/tokens/_token";
import {Statement} from "../abap/statements/_statement";
import {StatementNode} from "../abap/nodes";

export interface IFindResult {
  token: Token;
  statement: Statement;
  snode: StatementNode;
}

export class LSPUtils {

  public static find(reg: Registry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position):
      IFindResult | undefined {
    const file = reg.getABAPFile(textDocument.uri);
    if (file === undefined) {
      return undefined;
    }

    const line = position.line;
    const character = position.character;

    for (const statement of file.getStatements()) {
      for (const token of statement.getTokens()) {
// assumption: no tokens span multiple lines
        if (token.getRow() - 1 === line
            && token.getCol() - 1 <= character
            && token.getCol() - 1 + token.getStr().length > character) {
          return {
            token: token,
            statement: statement.get(),
            snode: statement};
        }
      }
    }

    return undefined;
  }

}