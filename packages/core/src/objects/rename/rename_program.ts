import * as Statements from "../../abap/2_statements/statements";
import * as Expressions from "../../abap/2_statements/expressions";
import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile, TextEdit} from "vscode-languageserver-types";
import {IRegistry} from "../../_iregistry";
import {Program} from "..";
import {ObjectRenamer} from "./_object_renamer";
import {RenamerHelper} from "./renamer_helper";
import {IObject} from "../_iobject";
import {LSPUtils} from "../../lsp/_lsp_utils";
import {ABAPObject} from "../_abap_object";

export class RenameProgram implements ObjectRenamer {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public buildEdits(obj: IObject, oldName: string, newName: string): WorkspaceEdit | undefined {
    if (!(obj instanceof Program)) {
      throw new Error("RenameProgram, not a program");
    }

    const main = obj.getMainABAPFile();
    if (main === undefined) {
      throw new Error(`Main file not found, ${obj.getType()} ${obj.getName()}`);
    }

    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    const helper = new RenamerHelper(this.reg);

    changes = changes.concat(helper.buildXMLFileEdits(obj, "NAME", oldName, newName));
    changes = changes.concat(helper.renameFiles(obj, oldName, newName));

    const edits: TextEdit[] = [];
    for (const s of main.getStatements()) {
      if (s.get() instanceof Statements.Report || s.get() instanceof Statements.Program) {
        const exp = s.findFirstExpression(Expressions.ReportName);
        if (exp) {
          edits.push(TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName.toLowerCase()));
        }
      }
    }

    if (edits.length > 0) {
      changes.push(TextDocumentEdit.create({uri: main.getFilename(), version: 1}, edits));
    }

    // Rename INCLUDE statements in all ABAP objects
    for (const o of this.reg.getObjects()) {
      if (o instanceof ABAPObject && o !== obj) {
        for (const file of o.getABAPFiles()) {
          const includeEdits: TextEdit[] = [];
          for (const s of file.getStatements()) {
            if (s.get() instanceof Statements.Include ||
                s.get() instanceof Statements.Submit ||
                s.get() instanceof Statements.Perform) {
              for (const exp of s.findAllExpressions(Expressions.IncludeName)) {
                if (exp && exp.getFirstToken().getStr().toUpperCase() === oldName.toUpperCase()) {
                  includeEdits.push(TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName.toLowerCase()));
                }
              }
            }
          }
          if (includeEdits.length > 0) {
            changes.push(TextDocumentEdit.create({uri: file.getFilename(), version: 1}, includeEdits));
          }
        }
      }
    }

    return {
      documentChanges: changes,
    };
  }

}
