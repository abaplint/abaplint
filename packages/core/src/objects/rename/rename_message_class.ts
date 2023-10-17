import {IRegistry} from "../../_iregistry";
import {Range, TextEdit, WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile} from "vscode-languageserver-types";
import {MessageClass} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {IObject} from "../_iobject";
import {RenamerHelper} from "./renamer_helper";

export class RenameMessageClass implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof MessageClass)) {
      throw new Error("RenameMessageClass, not a message class");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "ARBGB", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));

    for (const message of obj.getMessages()) {
      for (const ref of this.reg.getMSAGReferences().listByMessage(obj.getName(), message.getNumber())) {
        const file = this.reg.getFileByName(ref.filename);
        if (file === undefined) {
          continue;
        }
        const rows = file.getRawRows();
        const i = ref.token.getRow() - 1;
        const index = rows[i].indexOf(oldName.toLowerCase());
        if (index >= 0) {
          const range = Range.create(i, index, i, index + oldName.length);
          changes.push(TextDocumentEdit.create({uri: file.getFilename(), version: 1}, [TextEdit.replace(range, newName.toLowerCase())]));
        }
      }
    }

    return {
      documentChanges: changes,
    };
  }

}