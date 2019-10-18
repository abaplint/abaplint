import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {CheckVariablesLogic} from "../abap/syntax/check_variables";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {Identifier} from "../abap/types/_identifier";

export class Definition {

  public static find(reg: Registry,
                     doc: LServer.TextDocumentIdentifier,
                     position: LServer.Position): LServer.Location | undefined {

    const file = reg.getABAPFile(doc.uri);
    if (file === undefined) {
      return undefined;
    }
    const obj = reg.getObject(file.getObjectType(), file.getObjectName());
    if (!(obj instanceof ABAPObject)) {
      return undefined;
    }

    const found = LSPUtils.find(reg, doc, position);
    if (found !== undefined) {
      const variables = new CheckVariablesLogic(reg, obj).traverseUntil(found.token);
      const resolved = variables.resolve(found.token.getStr());
      if (resolved instanceof Identifier) {
        const pos = resolved.getStart();
        return {
          uri: resolved.getFilename(),
          range: LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1),
        };
      }
    }

    return undefined;
  }

}