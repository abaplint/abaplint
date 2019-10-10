import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {Token} from "../abap/tokens/_token";
import {Statement} from "../abap/statements/_statement";

export class LSPUtils {

  public static find(reg: Registry, textDocument: LServer.TextDocumentIdentifier, position: LServer.Position):
      {token: Token, statement: Statement} | undefined {
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
          return {token, statement: statement.get()};
        }
      }
    }

    return undefined;
  }

}