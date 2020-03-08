import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {ABAPObject} from "../objects/_abap_object";
import {SpaghettiScope} from "../abap/syntax/spaghetti_scope";
import {SyntaxLogic} from "../abap/syntax/syntax";
import {LSPUtils} from "./_lsp_utils";

export class Highlight {
  private readonly reg: Registry;

  public constructor(reg: Registry) {
    this.reg = reg;
  }

  public listDefinitionPositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    const spaghetti = this.runSyntax(textDocument);
    if (spaghetti === undefined) {
      return [];
    }

    const defs = spaghetti.listDefinitions(textDocument.uri);
    const ret: LServer.Range[] = [];
    for (const d of defs) {
      ret.push(LSPUtils.tokenToRange(d.identifier.getToken()));
    }
    return ret;
  }

  public listReadPositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    const spaghetti = this.runSyntax(textDocument);
    if (spaghetti === undefined) {
      return [];
    }

    const reads = spaghetti.listReadPositions(textDocument.uri);
    const ret: LServer.Range[] = [];
    for (const d of reads) {
      ret.push(LSPUtils.tokenToRange(d.getToken()));
    }
    return ret;
  }

  public listWritePositions(textDocument: LServer.TextDocumentIdentifier): LServer.Range[] {
    const spaghetti = this.runSyntax(textDocument);
    if (spaghetti === undefined) {
      return [];
    }

    const writes = spaghetti.listWritePositions(textDocument.uri);
    const ret: LServer.Range[] = [];
    for (const d of writes) {
      ret.push(LSPUtils.tokenToRange(d.getToken()));
    }
    return ret;
  }

////////////////////////

  private runSyntax(textDocument: LServer.TextDocumentIdentifier): SpaghettiScope | undefined {
    const obj = this.findObject(textDocument);
    if (obj === undefined) {
      return undefined;
    }
    return new SyntaxLogic(this.reg, obj).run().spaghetti;
  }

  private findObject(textDocument: LServer.TextDocumentIdentifier): ABAPObject | undefined {
    const file = this.reg.getABAPFile(textDocument.uri);
    if (file === undefined) {
      return undefined;
    }

    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (obj instanceof ABAPObject) {
      return obj;
    } else {
      return undefined;
    }
  }
}