import * as LServer from "vscode-languageserver-types";
import {Symbols} from "./symbols";
import {Hover} from "./hover";
import {Diagnostics} from "./diagnostics";
import {Help} from "./help";
import {PrettyPrinter} from "../pretty_printer/pretty_printer";
import {Definition} from "./definition";
import {Rename} from "./rename";
import {Highlight} from "./highlight";
import {ITextDocumentPositionParams, IDocumentSymbolParams, IRenameParams, ICodeActionParams, ITextDocumentRange} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";
import {CodeActions} from "./code_actions";
import {IRegistry} from "../_iregistry";
import {References} from "./references";
import {Implementation} from "./implementation";
import {SemanticHighlighting} from "./semantic";
import {StatementFlow} from "../abap/flow/statement_flow";

// note Ranges are zero based in LSP,
// https://github.com/microsoft/language-server-protocol/blob/main/versions/protocol-2-x.md#range
// but 1 based in abaplint

// the types in this file are not completely correct
// see https://github.com/microsoft/vscode-languageserver-node/issues/354

export class LanguageServer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_documentSymbol
  public documentSymbol(params: IDocumentSymbolParams): LServer.DocumentSymbol[] {
    return new Symbols(this.reg).find(params.textDocument.uri);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_hover
  public hover(params: ITextDocumentPositionParams): LServer.Hover | undefined {
    const hover = new Hover(this.reg).find(params);
    if (hover) {
      return {contents: hover};
    }
    return undefined;
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_definition
  public gotoDefinition(params: ITextDocumentPositionParams): LServer.Location | undefined {
    return new Definition(this.reg).find(params.textDocument, params.position);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_formatting
  public documentFormatting(params: {
    textDocument: LServer.TextDocumentIdentifier,
    options?: LServer.FormattingOptions,
  }): LServer.TextEdit[] {

    const file = LSPUtils.getABAPFile(this.reg, params.textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const text = new PrettyPrinter(file, this.reg.getConfig()).run();
    const rows = file.getRawRows();

    return [{
      range: LServer.Range.create(0, 0, rows.length, rows[rows.length - 1].length + 1),
      newText: text,
    }];
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_publishDiagnostics
  public diagnostics(textDocument: LServer.TextDocumentIdentifier): LServer.Diagnostic[] {
    return new Diagnostics(this.reg).find(textDocument);
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
  public codeActions(params: ICodeActionParams): LServer.CodeAction[] {
    return new CodeActions(this.reg).find(params);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_documentHighlight
  public documentHighlight(_params: ITextDocumentPositionParams): LServer.DocumentHighlight[] {
    // todo, implement
    return [];
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_implementation
  public implementation(params: ITextDocumentPositionParams): LServer.Location[] {
    return new Implementation(this.reg).find(params.textDocument, params.position);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-14/#textDocument_references
  public references(params: ITextDocumentPositionParams): LServer.Location[] {
    return new References(this.reg).references(params);
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#semanticTokensLegend
  public static semanticTokensLegend(): LServer.SemanticTokensLegend {
    return SemanticHighlighting.semanticTokensLegend();
  }

  // https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#semanticTokensRangeParams
  public semanticTokensRange(range: ITextDocumentRange): LServer.SemanticTokens {
    return new SemanticHighlighting(this.reg).semanticTokensRange(range);
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

  public dumpStatementFlows(textDocument: LServer.TextDocumentIdentifier): string {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return "file not found";
    }
    const stru = file.getStructure();
    if (stru === undefined) {
      return "empty structure";
    }
    const graphs = new StatementFlow().build(stru);
    const wiz = graphs.map(g => g.toDigraph());
    return JSON.stringify(wiz);
  }

}