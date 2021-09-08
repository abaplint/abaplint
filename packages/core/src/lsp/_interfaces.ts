import * as LServer from "vscode-languageserver-types";

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

export interface IDocumentSymbolParams {
  textDocument: LServer.TextDocumentIdentifier;
}

export interface ITextDocumentRange {
  textDocument: LServer.TextDocumentIdentifier;
  start: LServer.Position;
  end: LServer.Position;
}