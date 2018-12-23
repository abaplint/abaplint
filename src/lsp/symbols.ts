import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {Token} from "../abap/tokens/_token";
import {ABAPFile} from "../files";

export class Symbols {

  public static find(reg: Registry, uri: string): LServer.DocumentSymbol[] {
    const file = reg.getABAPFile(uri);
    if (file === undefined) {
      return [];
    }

    let ret: LServer.DocumentSymbol[] = [];
    ret = ret.concat(this.outputClasses(file));
    return ret;
  }

  private static tokenToRange(token: Token): LServer.Range {
    return LServer.Range.create(token.getCol(), token.getRow(), token.getCol() + token.getStr().length, token.getRow());
  }

  private static beginEnd(first: Token, last: Token): LServer.Range {
    return LServer.Range.create(first.getCol(), first.getRow(), last.getCol() + last.getStr().length, last.getRow());
  }

  private static outputClasses(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const cla of file.getClassDefinitions()) {
      const nameToken = cla.getName();
      const symbol: LServer.DocumentSymbol = {
        name: nameToken.getStr(),
        kind: LServer.SymbolKind.Class,
        range: this.beginEnd(cla.getFirstToken(), cla.getLastToken()),
        selectionRange: this.tokenToRange(nameToken),
        children: [],
      };
// todo, methods and more
      ret.push(symbol);
    }

    return ret;
  }

}