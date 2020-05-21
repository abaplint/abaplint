import * as LServer from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {LSPLookup} from "./_lookup";

// go to definition
export class Definition {

  public static find(reg: IRegistry,
                     textDocument: LServer.TextDocumentIdentifier,
                     position: LServer.Position): LServer.Location | undefined {

    const file = LSPUtils.getABAPFile(reg, textDocument.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.findCursor(reg, {textDocument, position});
    if (found === undefined) {
      return undefined;
    }

    return LSPLookup.lookup(found, reg, obj)?.definition;
  }

}