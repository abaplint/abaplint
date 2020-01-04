import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {Symbols} from "./symbols";
import {Hover} from "./hover";
import {Diagnostics} from "./diagnostics";
import {Help} from "./help";
import {PrettyPrinter} from "../pretty_printer/pretty_printer";
import {Definition} from "./definition";
import {Rename} from "./rename";
import {Highlight} from "./highlight";

// note Ranges are zero based in LSP,
// https://github.com/microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md#range
// but 1 based in abaplint

// the types in this file are not completely correct
// see https://github.com/microsoft/vscode-languageserver-node/issues/354

export interface ITextDocumentPositionParams {
  textDocument: LServer.TextDocumentIdentifier;
  position: LServer.Position;
}

export interface IRenameParams {
  textDocument: LServer.TextDocumentIdentifier;
  position: LServer.Position;
  newName: string;
}

export interface ICodeActionParams {
  textDocument: LServer.TextDocumentIdentifier;
  range: LServer.Range;
  context: LServer.CodeActionContext;
}

export class LanguageServer {
  private readonly reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_documentSymbol
  public documentSymbol(params: LServer.DocumentSymbolParams): LServer.DocumentSymbol[] {
    return Symbols.find(this.reg, params.textDocument.uri);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_hover
  public hover(params: ITextDocumentPositionParams): LServer.Hover | undefined {
    const hover = Hover.find(this.reg, params);
    if (hover) {
      return {contents: hover};
    }
    return undefined;
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_definition
  public gotoDefinition(params: ITextDocumentPositionParams): LServer.Location | undefined {
    return Definition.find(this.reg, params.textDocument, params.position);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_formatting
  public documentFormatting(params: {
    textDocument: LServer.TextDocumentIdentifier,
    options?: LServer.FormattingOptions,
  }): LServer.TextEdit[] {

    const file = this.reg.getABAPFile(params.textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const text = new PrettyPrinter(file, this.reg.getConfig()).run();

    return [{
      range: LServer.Range.create(0, 0, Number.MAX_VALUE, 0),
      newText: text,
    }];
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_publishDiagnostics
  public diagnostics(textDocument: LServer.TextDocumentIdentifier): LServer.Diagnostic[] {
    return Diagnostics.find(this.reg, textDocument);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_prepareRename
  public prepareRename(params: ITextDocumentPositionParams): {range: LServer.Range, placeholder: string} | undefined {
    return new Rename(this.reg).prepareRename(params);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_rename
  public rename(params: IRenameParams): LServer.WorkspaceEdit | undefined {
    return new Rename(this.reg).rename(params);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_codeAction
  public codeActions(_params: ICodeActionParams): LServer.CodeAction[] {
    // todo, implement
    return [];
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_documentHighlight
  public documentHighlight(_params: ITextDocumentPositionParams): LServer.DocumentHighlight[] {
    // todo, implement
    return [];
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_implementation
  public implementation(_params: ITextDocumentPositionParams): LServer.Location[] {
    // todo, implement
    return [];
  }

////////////////////////////////////////
//  ______      _
// |  ____|    | |
// | |__  __  _| |_ _ __ __   ___
// |  __| \ \/ / __| '__/ _` / __|
// | |____ >  <| |_| | | (_| \__ \
// |______/_/\_\\__|_|  \__,_|___/
// extras, abaplint specific
////////////////////////////////////////

  public help(textDocument: LServer.TextDocumentIdentifier, position: LServer.Position): string {
    return Help.find(this.reg, textDocument, position);
  }

  public listDefinitionPositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    return new Highlight(this.reg).listDefinitionPositions(textDocument);
  }

  public listReadPositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    return new Highlight(this.reg).listReadPositions(textDocument);
  }

  public listWritePositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    return new Highlight(this.reg).listWritePositions(textDocument);
  }

}