import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {FormDefinition} from "../abap/types";
import {ABAPFile} from "../files";
import {Identifier} from "../abap/types/_identifier";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {CurrentScope} from "../abap/syntax/_current_scope";
import * as Tokens from "../abap/1_lexer/tokens";
import {ITextDocumentPositionParams} from "./_interfaces";
import {Registry} from "../registry";

export class Hover {
  public static find(reg: IRegistry, pos: ITextDocumentPositionParams): LServer.MarkupContent | undefined {

    const file = LSPUtils.getABAPFile(reg, pos.textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.findCursor(reg, pos);
    if (found === undefined) {
      return undefined;
    } else if (found.token instanceof Tokens.String) {
      return {kind: LServer.MarkupKind.Markdown, value: "String"};
    } else if (found.token instanceof Tokens.StringTemplate
        || found.token instanceof Tokens.StringTemplateBegin
        || found.token instanceof Tokens.StringTemplateEnd
        || found.token instanceof Tokens.StringTemplateMiddle) {
      return {kind: LServer.MarkupKind.Markdown, value: "String Template"};
    } else if (found.token instanceof Tokens.Comment) {
      return {kind: LServer.MarkupKind.Markdown, value: "Comment"};
    }

    const lookup = LSPUtils.lookup(found, reg, obj);
    if (lookup instanceof ABAPFile) {
      return {kind: LServer.MarkupKind.Markdown, value: "File"};
    } else if (lookup instanceof FormDefinition) {
      return {kind: LServer.MarkupKind.Markdown, value: this.hoverFormDefinition(lookup)};
    } else if (lookup instanceof TypedIdentifier) {
      let value = "Resolved, Typed\n\n" +
        "Type:\n\n" + lookup.getType().toText();
      if (lookup.getValue()) {
        value = value + "Value:\n\n```" + lookup.getValue() + "```";
      }
      if (lookup.getMeta().length > 0) {
        value = value + "Meta: " + lookup.getMeta().join(", ");
      }
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
    const scope = CurrentScope.buildDefault(new Registry());
    return "FORM info, todo, parameter count: " + def.getParameters(scope).length;
  }

}