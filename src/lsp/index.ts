import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {Symbols} from "./symbols";
import {Hover} from "./hover";
import {Diagnostics} from "./diagnostics";
import {Help} from "./help";
import {PrettyPrinter} from "../pretty_printer/pretty_printer";
import {Definition} from "./definition";

// the types in this file are not completely correct
// see https://github.com/microsoft/vscode-languageserver-node/issues/354

// note Ranges are zero based in LSP,
// https://github.com/microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md#range
// but 1 based in abaplint

export class LanguageServer {
  private readonly reg: Registry;

  constructor (reg: Registry) {
    this.reg = reg;
  }

  public help(textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {
    return Help.find(this.reg, textDocument, position);
  }

  public documentSymbol(params: LServer.DocumentSymbolParams): LServer.DocumentSymbol[] {
    return Symbols.find(this.reg, params.textDocument.uri);
  }

  public hover(params: {textDocument: LServer.TextDocumentIdentifier, position: LServer.Position}): LServer.Hover | undefined {
    const hover = Hover.find(this.reg, params.textDocument, params.position);
    if (hover) {
      return {contents: hover};
    }
    return undefined;
  }

// go to definition
  public definition(params: {textDocument: LServer.TextDocumentIdentifier, position: LServer.Position}): LServer.Location | undefined {
    return Definition.find(this.reg, params.textDocument, params.position);
  }

  public documentFormatting(params: {textDocument: LServer.TextDocumentIdentifier,
    options?: LServer.FormattingOptions}): LServer.TextEdit[] {

    const file = this.reg.getABAPFile(params.textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const text = new PrettyPrinter(file, this.reg.getConfig()).run();
    const tokens = file.getTokens();
    const last = tokens[tokens.length - 1];

    return [{
      range: LServer.Range.create(0, 0, last.getRow(), last.getCol() + last.getStr().length),
      newText: text,
    }];
  }

  public diagnostics(textDocument: LServer.TextDocumentIdentifier): LServer.Diagnostic[] {
    return Diagnostics.find(this.reg, textDocument);
  }

}