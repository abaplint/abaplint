/* eslint-disable max-len */
import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {Identifier} from "../abap/4_file_information/_identifier";
import {LSPUtils} from "./_lsp_utils";
import {InfoAttribute} from "../abap/4_file_information/_abap_file_information";
import {ABAPFile} from "../abap/abap_file";
import {EndMethod} from "../abap/2_statements/statements";
import {Position} from "../position";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";

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

    const ret: LServer.DocumentSymbol[] = [];
    ret.push(...this.outputClasses(file));
    ret.push(...this.outputForms(file));
    ret.push(...this.outputModules(file));
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

  private newSymbolRanged(identifier: Identifier, kind: LServer.SymbolKind, children: LServer.DocumentSymbol[], range: LServer.Range): LServer.DocumentSymbol {
    const symbol: LServer.DocumentSymbol = {
      name: identifier.getName(),
      kind: kind,
      range: range,
      selectionRange: this.selectionRange(identifier),
      children,
    };

    return symbol;
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

  private outputModules(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Module) {
        const nameToken = statement.findFirstExpression(Expressions.FormName)?.getFirstToken();
        if (nameToken === undefined) {
          continue;
        }
        const identifier = new Identifier(nameToken, file.getFilename());
        const symbol = this.newSymbol(identifier, LServer.SymbolKind.Module, []);
        ret.push(symbol);
      }
    }

    return ret;
  }

  private outputClasses(file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const cla of file.getInfo().listClassDefinitions()) {
      const children: LServer.DocumentSymbol[] = [];
      children.push(...this.outputClassAttributes(cla.attributes));
      const symbol = this.newSymbol(cla.identifier, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    for (const cla of file.getInfo().listClassImplementations()) {
      const children: LServer.DocumentSymbol[] = [];
      children.push(...this.outputMethodImplementations(cla.methods, file));
      const symbol = this.newSymbol(cla.identifier, LServer.SymbolKind.Class, children);
      ret.push(symbol);
    }

    return ret;
  }

  private outputMethodImplementations(methods: readonly Identifier[], file: ABAPFile): LServer.DocumentSymbol[] {
    const ret: LServer.DocumentSymbol[] = [];

    for (const method of methods) {
      const start = method.getStart();
      let end: Position | undefined = undefined;
      for (const s of file.getStatements()) {
        if (s.getFirstToken().getStart().isBefore(start)) {
          continue;
        }
        if (s.get() instanceof EndMethod) {
          end = s.getLastToken().getEnd();
          break;
        }
      }

      if (end === undefined) {
        continue;
      }

      const range = LServer.Range.create(start.getRow() - 1, start.getCol() - 1, end.getRow() - 1, end.getCol() - 1);

      const symbol = this.newSymbolRanged(method, LServer.SymbolKind.Method, [], range);
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

}