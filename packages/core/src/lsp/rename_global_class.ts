import {WorkspaceEdit, TextDocumentEdit, CreateFile, RenameFile, DeleteFile, TextEdit, Range} from "vscode-languageserver-types";
import {IRegistry} from "../_iregistry";
import {Class} from "../objects";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {LSPUtils} from "./_lsp_utils";

// todo, move this logic to somewhere else?

export class RenameGlobalClass {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run(oldName: string, newName: string): WorkspaceEdit | undefined {
    let changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[] = [];
    // const clas = this.reg.getObject("CLAS", oldName) as Class | undefined;
    const clas = this.reg.getObjectByType(Class, oldName);
    if (clas === undefined) {
      return undefined;
    }

    // todo, refactor to somewhere else, overlaps with rule allowed_object_naming
    // todo, also do not allow strange characters and spaces
    if (newName.length > clas.getAllowedNaming().maxLength) {
      return undefined;
    }

    const main = clas.getMainABAPFile();
    if (main === undefined) {
      return undefined;
    }

// todo, make this more generic, specify array of node paths to be replaced
    const edits: TextEdit[] = [];
    for (const s of main.getStatements()) {
      if (s.get() instanceof Statements.ClassDefinition) {
        const exp = s.findFirstExpression(Expressions.ClassName);
        if (exp === undefined) {
          continue;
        }
        edits.push(TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName));
      } else if (s.get() instanceof Statements.ClassImplementation) {
        const exp = s.findFirstExpression(Expressions.ClassName);
        if (exp === undefined) {
          continue;
        }
        edits.push(TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName));
      }
    }

    changes.push(TextDocumentEdit.create({uri: main.getFilename(), version: 1}, edits));
    changes = changes.concat(this.buildXMLFileEdits(clas, oldName, newName));
    changes = changes.concat(this.renameFiles(clas, oldName, newName));

    return {
      documentChanges: changes,
    };
  }

  private renameFiles(clas: Class, oldName: string, name: string): RenameFile[] {
    const list: RenameFile[] = [];

    const newName = name.toLowerCase().replace(/\//g, "%23");

    for (const f of clas.getFiles()) {
// todo, this is not completely correct, ie. if the URI contains the same directory name as the object name
      const newFilename = f.getFilename().replace(oldName, newName);
      list.push(RenameFile.create(f.getFilename(), newFilename));
    }

    return list;
  }

  private buildXMLFileEdits(clas: Class, oldName: string, newName: string): TextDocumentEdit[] {
    const changes: TextDocumentEdit[] = [];
    const xml = clas.getXMLFile();

    if (xml !== undefined) {
      const search = "<CLSNAME>" + oldName.toUpperCase() + "</CLSNAME>";
      const rows = xml.getRawRows();
      for (let i = 0; i < rows.length; i++) {
        const index = rows[i].indexOf(search);
        if (index >= 0) {
          const range = Range.create(i, index + 9, i, index + oldName.length + 9);
          changes.push(
            TextDocumentEdit.create({uri: xml.getFilename(), version: 1}, [TextEdit.replace(range, newName.toUpperCase())]));
          break;
        }
      }
    }

    return changes;
  }

}