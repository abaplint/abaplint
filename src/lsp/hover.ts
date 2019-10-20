import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {FormDefinition} from "../abap/types";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/types/_identifier";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {TypedConstantIdentifier} from "../abap/types/_typed_constant_identifier";

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

    const found = LSPUtils.findCursor(reg, textDocument, position);
    if (found === undefined) {
      return {kind: LServer.MarkupKind.Markdown, value: "Cursor token not found"};
    }

    const lookup = LSPUtils.lookup(found, reg, obj);
    if (lookup instanceof ABAPFile) {
      return {kind: LServer.MarkupKind.Markdown, value: "File"};
    } else if (lookup instanceof FormDefinition) {
      return {kind: LServer.MarkupKind.Markdown, value: this.hoverFormDefinition(lookup)};
    } else if (lookup instanceof TypedConstantIdentifier) {
      const value = "Resolved, Typed, Constant\n\n" +
        "`" + lookup.getType().toText() + "`\n\n" +
        "Value: `" + lookup.getValue() + "`";
      return {kind: LServer.MarkupKind.Markdown, value};
    } else if (lookup instanceof TypedIdentifier) {
      const value = "Resolved, Typed\n\n" +
        "`" + lookup.getType().toText() + "`";
      return {kind: LServer.MarkupKind.Markdown, value};
    } else if (lookup instanceof Identifier) {
      return {kind: LServer.MarkupKind.Markdown, value: "Resolved"};
    } else {
      return {kind: LServer.MarkupKind.Markdown, value: "Unknown"};
    }
  }

  private static hoverFormDefinition(def: FormDefinition): string {
// todo, list parameters properly in hover information
    return "FORM info, todo, parameter count: " + def.getParameters().length;
  }

}