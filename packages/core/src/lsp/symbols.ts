import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/4_file_information/_identifier";
import {LSPUtils} from "./_lsp_utils";
import {InfoAttribute, InfoMethodDefinition} from "../abap/4_file_information/_abap_file_information";

export class Symbols {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public find(uri: string): LServer.DocumentSymbol[] {
    const file = LSPUtils.getABAPFile(this.reg, uri);
    if (file === undefined) {
      return [];
    }

    let ret: LServer.DocumentSymbol[] = [];
    ret = ret.concat(this.outputClasses(file));
    ret = ret.concat(this.outputForms(file));
    return ret;
  }

  private selectionRange(identifier: Identifier): LServer.Range {
    const pos = identifier.getStart();
    const str = identifier.getName();
    return LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1 + str.length);
  }

  private range(identifer: Identifier): LServer.Range {
    const start = identifer.getStart();
    const end = identifer.getEnd();
    return LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);
  }

  private newSymbol(identifier: Identifier, kind: LServer.SymbolKind, children: LServer.DocumentSymbol[]): LServer.DocumentSymbol {
    const symbol: LServer.DocumentSymbol = {
      name: identifier.getName(),
      kind: kind,
      range: this.range(identifier),
      selectionRange: this.selectionRange(identifier),
      children,
    };

    return symbol;
  }

  private outputForms(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];
    for (const form of file.getInfo().listFormDefinitions()) {
      const symbol = this.newSymbol(form.identifier, LServer.SymbolKind.Function, []);
      ret.push(symbol);
    }
    return ret;
  }

  private outputClasses(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const cla of file.getInfo().listClassDefinitions()) {
      let children: LServer.DocumentSymbol[] = [];
      children = children.concat(this.outputClassAttributes(cla.attributes));
      children = children.concat(this.outputMethodDefinitions(cla.methods));
      const symbol = this.newSymbol(cla.identifier, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    for (const cla of file.getInfo().listClassImplementations()) {
      let children: LServer.DocumentSymbol[] = [];
      children = children.concat(this.outputMethodImplementations(cla.methods));
      const symbol = this.newSymbol(cla.identifier, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    return ret;
  }

  private outputMethodImplementations(methods: readonly Identifier[]): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];
    for (const method of methods) {
      const symbol = this.newSymbol(method, LServer.SymbolKind.Method, []);
      ret.push(symbol);
    }
    return ret;
  }

  private outputClassAttributes(attr: readonly InfoAttribute[]): LServer.DocumentSymbol[] {
    if (attr === undefined) {
      return [];
    }
    const ret: LServer.DocumentSymbol[] = [];

    for (const id of attr) {
      ret.push(this.newSymbol(id.identifier, LServer.SymbolKind.Property, []));
    }
    // todo, also add constants

    return ret;
  }

  private outputMethodDefinitions(methods: readonly InfoMethodDefinition[]): LServer.DocumentSymbol[] {
    if (methods === undefined) {
      return [];
    }
// todo
    return [];
  }

}