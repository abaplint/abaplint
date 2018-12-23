import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {Symbols} from "./symbols";

export class LanguageServer {
  private reg: Registry;

  constructor (reg: Registry) {
    this.reg = reg;
  }

  public documentSymbol(params: LServer.DocumentSymbolParams): LServer.DocumentSymbol[] {
    return Symbols.find(this.reg, params.textDocument.uri);
  }

  public hover(_params: LServer.TextDocumentPositionParams): LServer.Hover | undefined {
    return undefined; // todo
  }

  public diagnostics(_uri: string): LServer.Diagnostic[] {
    return []; // todo
  }

}