import * as LServer from "vscode-languageserver-types";
import {Registry} from "..";
import {Class} from "../objects";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import {LSPUtils} from "./_lsp_utils";

// todo, move this logic to somewhere else?

export class RenameGlobalClass {
  private readonly reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  public run(oldName: string, newName: string): LServer.WorkspaceEdit | undefined {
    const changes: (LServer.TextDocumentEdit | LServer.CreateFile | LServer.RenameFile | LServer.DeleteFile)[] = [];
    const clas = this.reg.getObject("CLAS", oldName) as Class | undefined;
    if (clas === undefined) {
      return undefined;
    }

    const main = clas.getMainABAPFile();
    if (main === undefined) {
      return undefined;
    }

// todo, make this more generic, specify array of node paths to be replaced
    const edits: LServer.TextEdit[] = [];
    for (const s of main.getStatements()) {
      if (s.get() instanceof Statements.ClassDefinition) {
        const exp = s.findFirstExpression(Expressions.ClassName);
        if (exp === undefined) {
          continue;
        }
        edits.push(LServer.TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName));
      } else if (s.get() instanceof Statements.ClassImplementation) {
        const exp = s.findFirstExpression(Expressions.ClassName);
        if (exp === undefined) {
          continue;
        }
        edits.push(LServer.TextEdit.replace(LSPUtils.tokenToRange(exp.getFirstToken()), newName));
      }
    }

    changes.push(LServer.TextDocumentEdit.create({uri: main.getFilename(), version: 1}, edits));

    for (const f of clas.getFiles()) {
      const newFilename = f.getFilename().replace(oldName, newName.toLowerCase());
      changes.push(LServer.RenameFile.create(f.getFilename(), newFilename));
    }

    return {
      documentChanges: changes,
    };
  }

}