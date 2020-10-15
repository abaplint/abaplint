import * as Statements from "../../abap/2_statements/statements";
import * as Expressions from "../../abap/2_statements/expressions";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile, TextEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {LSPUtils} from "../../lsp/_lsp_utils";
import {ObjectRenamer} from "./_object_renamer";
import {RenamerHelper} from "./renamer_helper";
import {IObject} from "../_iobject";
import {Interface} from "../interface";

export class RenameGlobalInterface implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof Interface)) {
      throw new Error("not an interface");
    }

    const main = obj.getMainABAPFile();
    if (main === undefined) {
      throw new Error("Main file not found");
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];

    // todo, this is actually the same as "id" ?
    {
      const edits: TextEdit[] = [];
      for (const s of main.getStatements()) {
        if (s.get() instanceof Statements.Interface) {
          const exp = s.findFirstExpression(Expressions.InterfaceName);
          if (exp === undefined) {
            continue;
          }
          edits.push(TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName));
        }
      }
      changes.push(TextDocumentEdit.create({uri: main.getFilename(), version: 1}, edits));
    }

    const helper = new RenamerHelper(this.reg);
    changes = changes.concat(helper.buildXMLFileEdits(obj, "CLSNAME", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));
    changes = changes.concat(helper.renameReferences(obj.getIdentifier(), newName));

    return {
      documentChanges: changes,
    };
  }

}