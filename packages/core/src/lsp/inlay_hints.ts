import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {LSPUtils} from "./_lsp_utils";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";

export type InlayHintsSettings = {
  inferredTypes: boolean,
};

export class InlayHints {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public list(textDocument: LServer.TextDocumentIdentifier, settings: InlayHintsSettings = {inferredTypes: true}): LServer.InlayHint[] {
    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return [];
    }

    const obj = this.reg.findObjectForFile(file);
    if (obj === undefined || !(obj instanceof ABAPObject)) {
      return [];
    }
    new SyntaxLogic(this.reg, obj).run();

    const ret: LServer.InlayHint[] = [];

    if (settings.inferredTypes === true) {
// todo
      ret.push({
        label: "INLAY HINT",
        tooltip: "Inferred type",
        kind: LServer.InlayHintKind.Type,
        paddingLeft: true,
        paddingRight: true,
        position: {line: 216, character: 20},
      });
    }

    return ret;
  }

}