import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {ITextDocumentPositionParams} from "./_interfaces";
import {LSPUtils} from "./_lsp_utils";

export class References {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public references(pos: ITextDocumentPositionParams): LServer.Location[] {

    const file = LSPUtils.getABAPFile(this.reg, pos.textDocument.uri);
    if (file === undefined) {
      return [];
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const found = LSPUtils.findCursor(this.reg, pos);
    if (found) {
      return []; // todo
    }
    return [];
  }

}