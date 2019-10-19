import * as LServer from "vscode-languageserver-types";
import {Registry} from "../registry";
import {Identifier} from "../abap/types/_identifier";
import {ABAPObject} from "../objects/_abap_object";
import {LSPUtils} from "./_lsp_utils";
import {ABAPFile} from "../files";

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

    const found = LSPUtils.findCursor(reg, doc, position);
    if (found === undefined) {
      return undefined;
    }

    const lookup = LSPUtils.lookup(found, reg, obj);
    if (lookup instanceof ABAPFile) {
      return this.ABAPFileResult(lookup);
    } else if (lookup instanceof Identifier) {
      return this.buildResult(lookup);
    }

    return undefined;
  }

  private static buildResult(resolved: Identifier): LServer.Location {
    const pos = resolved.getStart();
    return {
      uri: resolved.getFilename(),
      range: LServer.Range.create(pos.getRow() - 1, pos.getCol() - 1, pos.getRow() - 1, pos.getCol() - 1),
    };
  }

  private static ABAPFileResult(abap: ABAPFile): LServer.Location {
    return {
      uri: abap.getFilename(),
      range: LServer.Range.create(0, 0, 0, 0),
    };
  }

}