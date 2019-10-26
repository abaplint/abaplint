import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/types/_identifier";
import {Attributes, MethodDefinitions, MethodImplementation} from "../abap/types";
import {Scope} from "../abap/syntax/_scope";

export class Symbols {
  private static reg: Registry;

  public static find(reg: Registry, uri: string): LServer.DocumentSymbol[] {
    const file = reg.getABAPFile(uri);
    if (file === undefined) {
      return [];
    }
    this.reg = reg;

    let ret: LServer.DocumentSymbol[] = [];
    ret = ret.concat(this.outputClasses(file));
    ret = ret.concat(this.outputForms(file));
    return ret;
  }

  private static selectionRange(identifier: Identifier): LServer.Range {
    const pos = identifier.getStart();
    const str = identifier.getName();
    return LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1 + str.length);
  }

  private static range(identifer: Identifier): LServer.Range {
    const start = identifer.getStart();
    const end = identifer.getEnd();
    return LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);
  }

  private static newSymbol(identifier: Identifier, kind: LServer.SymbolKind, children: LServer.DocumentSymbol[]): LServer.DocumentSymbol {
    const symbol: LServer.DocumentSymbol = {
      name: identifier.getName(),
      kind: kind,
      range: this.range(identifier),
      selectionRange: this.selectionRange(identifier),
      children,
    };

    return symbol;
  }

  private static outputForms(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];
    for (const form of file.getFormDefinitions()) {
      const symbol = this.newSymbol(form, LServer.SymbolKind.Function, []);
      ret.push(symbol);
    }
    return ret;
  }

  private static outputClasses(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const cla of file.getClassDefinitions()) {
      let children: LServer.DocumentSymbol[] = [];
      children = children.concat(this.outputClassAttributes(cla.getAttributes(Scope.buildDefault(this.reg))));
      children = children.concat(this.outputMethodDefinitions(cla.getMethodDefinitions()));
      const symbol = this.newSymbol(cla, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    for (const cla of file.getClassImplementations()) {
      let children: LServer.DocumentSymbol[] = [];
      children = children.concat(this.outputMethodImplementations(cla.getMethodImplementations()));
      const symbol = this.newSymbol(cla, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    return ret;
  }

  private static outputMethodImplementations(methods: MethodImplementation[]): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];
    for (const method of methods) {
      const symbol = this.newSymbol(method, LServer.SymbolKind.Method, []);
      ret.push(symbol);
    }
    return ret;
  }

  private static outputClassAttributes(attr: Attributes | undefined): LServer.DocumentSymbol[] {
    if (attr === undefined) {
      return [];
    }
    const ret: LServer.DocumentSymbol[] = [];

    for (const id of attr.getStatic()) {
      ret.push(this.newSymbol(id, LServer.SymbolKind.Property, []));
    }
    for (const id of attr.getInstance()) {
      ret.push(this.newSymbol(id, LServer.SymbolKind.Property, []));
    }
    /* todo
    for (const id of attr.getConstants()) {
      ret.push(this.newSymbol(id, LServer.SymbolKind.Constant, []));
    }
    */

    return ret;
  }

  private static outputMethodDefinitions(methods: MethodDefinitions | undefined): LServer.DocumentSymbol[] {
    if (methods === undefined) {
      return [];
    }
// todo
    return [];
  }

}