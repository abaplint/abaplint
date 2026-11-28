import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {HttpService, InboundService} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {RenamerHelper} from "./renamer_helper";
import {IObject} from "../_iobject";

/** HTTP service of ABAP Cloud. The inbound services (SCO2) that publish it follow */
export class RenameHttpService implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof HttpService)) {
      throw new Error("not a http service");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "HTTPID", oldName, newName));
    // the text and the handler entries are keyed by the service
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ID", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));

    for (const inbound of this.reg.getObjectsByType("SCO2")) {
      changes = changes.concat(helper.buildXMLFileEdits(inbound as InboundService, "HTTP_SERVICE_ID", oldName, newName));
    }

    return {
      documentChanges: changes,
    };
  }

}
