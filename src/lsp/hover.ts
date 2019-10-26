import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {FormDefinition} from "../abap/types";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/types/_identifier";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {TypedConstantIdentifier} from "../abap/types/_typed_constant_identifier";
import {Scope} from "../abap/syntax/_scope";
import * as Tokens from "../abap/tokens";

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
    } else if (found.token instanceof Tokens.String) {
      return {kind: LServer.MarkupKind.Markdown, value: "String"};
    } else if (found.token instanceof Tokens.Comment) {
      return {kind: LServer.MarkupKind.Markdown, value: "Comment"};
    }

    const lookup = LSPUtils.lookup(found, reg, obj);
    if (lookup instanceof ABAPFile) {
      return {kind: LServer.MarkupKind.Markdown, value: "File"};
    } else if (lookup instanceof FormDefinition) {
      return {kind: LServer.MarkupKind.Markdown, value: this.hoverFormDefinition(lookup)};
    } else if (lookup instanceof TypedConstantIdentifier) {
      const value = "Resolved, Typed, Constant\n\n" +
        "Type:\n\n" + lookup.getType().toText() + "\n\n" +
        "Value:\n\n```" + lookup.getValue() + "```";
      return {kind: LServer.MarkupKind.Markdown, value};
    } else if (lookup instanceof TypedIdentifier) {
      const value = "Resolved, Typed\n\n" +
        "Type:\n\n" + lookup.getType().toText();
      return {kind: LServer.MarkupKind.Markdown, value};
    } else if (lookup instanceof Identifier) {
      return {kind: LServer.MarkupKind.Markdown, value: "Resolved"};
    } else {
      return {kind: LServer.MarkupKind.Markdown, value: "Unknown"};
    }
  }

  private static hoverFormDefinition(def: FormDefinition): string {
// todo, list parameters properly in hover information
// todo, properly handling scope
    const scope = Scope.buildDefault(new Registry());
    return "FORM info, todo, parameter count: " + def.getParameters(scope).length;
  }

}