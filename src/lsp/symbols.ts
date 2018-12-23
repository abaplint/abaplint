import * as LServer from "vscode-languageserver-protocol";
import * as Structures from "../abap/structures";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {Registry} from "../registry";
import {INode} from "../abap/nodes/_inode";
import {StructureNode} from "../abap/nodes";
import {Token} from "../abap/tokens/_token";

export class Symbols {

  public static find(reg: Registry, uri: string): LServer.DocumentSymbol[] {
    const file = reg.getABAPFile(uri);
    if (file === undefined) {
      return [];
    }

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    return this.traverse(structure);
  }

  private static tokenToRange(token: Token): LServer.Range {
    return LServer.Range.create(token.getCol(), token.getRow(), token.getCol() + token.getStr().length, token.getRow());
  }

  private static beginEnd(node: StructureNode): LServer.Range {
    const first = node.getFirstToken();
    const last = node.getLastToken();

    return LServer.Range.create(first.getCol(), first.getRow(), last.getCol() + last.getStr().length, last.getRow());
  }

  private static traverse(node: INode): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    if (node instanceof StructureNode && node.get() instanceof Structures.ClassDefinition) {
      const nameToken = node.findFirstStatement(Statements.ClassDefinition)!.findFirstExpression(Expressions.ClassName)!.getFirstToken();

      const symbol: LServer.DocumentSymbol = {
        name: nameToken.getStr(),
        kind: LServer.SymbolKind.Class,
        range: this.beginEnd(node),
        selectionRange: this.tokenToRange(nameToken),
        children: [],
      };

      for (const child of node.getChildren()) {
        symbol.children = symbol.children!.concat(this.traverse(child));
      }

      ret.push(symbol);
    }

    return ret;
  }

}