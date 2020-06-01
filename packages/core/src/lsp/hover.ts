import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import * as Tokens from "../abap/1_lexer/tokens";
import {ITextDocumentPositionParams} from "./_interfaces";
import {LSPLookup} from "./_lookup";


export class Hover {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public find(pos: ITextDocumentPositionParams): LServer.MarkupContent | undefined {

    const file = LSPUtils.getABAPFile(this.reg, pos.textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.findCursor(this.reg, pos);
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

    const lookup = LSPLookup.lookup(found, this.reg, obj);
    if (lookup?.hover) {
      return {kind: LServer.MarkupKind.Markdown, value: lookup.hover};
    }

    return undefined;
  }

}