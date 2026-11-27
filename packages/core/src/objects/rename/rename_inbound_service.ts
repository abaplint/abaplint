import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {IAMApp, InboundService} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {RenamerHelper} from "./renamer_helper";
import {IObject} from "../_iobject";

/** Inbound service (SCO2). The IAM apps (SIA6) of the inbound service follow */
export class RenameInboundService implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof InboundService)) {
      throw new Error("not an inbound service");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "IBS_ID", oldName, newName));
    changes = changes.concat(helper.buildXMLFileEdits(obj, "NAME", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));

    for (const app of this.reg.getObjectsByType("SIA6")) {
      changes = changes.concat(helper.buildXMLFileEdits(app as IAMApp, "SECONDARY_ID", oldName, newName));
    }

    return {
      documentChanges: changes,
    };
  }

}
