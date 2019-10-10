import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {CheckVariablesLogic} from "../abap/syntax/check_variables";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";

export class Hover {
  public static find(reg: Registry,
                     textDocument: LServer.TextDocumentIdentifier,
                     position: LServer.Position): LServer.MarkupContent | undefined {

    const file = reg.getABAPFile(textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.find(reg, textDocument, position);
    if (found !== undefined) {
      const resolved = new CheckVariablesLogic(reg, obj).resolveToken(found.token);
      if (resolved !== undefined) {
        return {kind: LServer.MarkupKind.Markdown, value: "Resolved"};
      }
    }

    return {kind: LServer.MarkupKind.Markdown, value: "Not resolved"};
  }

}