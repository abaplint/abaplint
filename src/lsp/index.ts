import * as LServer from "vscode-languageserver-protocol";
import {Registry} from "../registry";
import {Symbols} from "./symbols";
import {PrettyPrinter} from "../abap/pretty_printer";

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

  public documentFormatting(params: LServer.DocumentFormattingParams): LServer.TextEdit[] {
    const file = this.reg.getABAPFile(params.textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const text = new PrettyPrinter(file).run();
    const tokens = file.getTokens();
    const first = tokens[0];
    const last = tokens[tokens.length - 1];

    return [{
      range: LServer.Range.create(first.getRow(), first.getCol(), last.getRow(), last.getCol() + last.getStr().length),
      newText: text,
    }];
  }

  public diagnostics(_uri: string): LServer.Diagnostic[] {
    return []; // todo
  }

}