import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";

export class Hover {
  public static find(reg: Registry, uri: string, line: number, character: number): LServer.MarkupContent | undefined {
    const file = reg.getABAPFile(uri);
    if (file === undefined) {
      return undefined;
    }

    for (const statement of file.getStatements()) {
      for (const token of statement.getTokens()) {
// assumption: no tokens span multiple lines
        if (token.getRow() - 1 === line
            && token.getCol() - 1 <= character
            && token.getCol() - 1 + token.getStr().length >= character) {
          const value = token.getStr() + "\n" +
            statement.constructor.name + "\n" +
            token.constructor.name;
          return {kind: LServer.MarkupKind.Markdown, value};
        }
      }
    }

    return undefined;
  }
}