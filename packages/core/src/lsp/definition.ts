import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {LSPLookup} from "./_lookup";

// go to definition
export class Definition {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public find(textDocument: LServer.TextDocumentIdentifier,
              position: LServer.Position): LServer.Location | undefined {

    const file = LSPUtils.getABAPFile(this.reg, textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = this.reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.findCursor(this.reg, {textDocument, position});
    if (found === undefined) {
      return undefined;
    }

    return LSPLookup.lookup(found, this.reg, obj)?.definition;
  }

}