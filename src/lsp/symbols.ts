import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {ABAPFile} from "../files";
import {Position} from "../position";

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

  private static toRange(str: string, pos: Position): LServer.Range {
    return LServer.Range.create(pos.getCol(), pos.getRow(), pos.getCol() + str.length, pos.getRow());
  }

  private static beginEnd(first: Position, last: Position): LServer.Range {
    return LServer.Range.create(first.getCol(), first.getRow(), last.getCol(), last.getRow());
  }

  private static outputClasses(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const cla of file.getClassDefinitions()) {
      const symbol: LServer.DocumentSymbol = {
        name: cla.getName(),
        kind: LServer.SymbolKind.Class,
        range: this.beginEnd(cla.getStart(), cla.getEnd()),
        selectionRange: this.toRange(cla.getName(), cla.getPosition()),
        children: [],
      };
// todo, methods and more
      ret.push(symbol);
    }

    return ret;
  }

}