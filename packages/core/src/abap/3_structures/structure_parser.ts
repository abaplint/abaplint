import {Unknown, Empty, Comment as StatementComment} from "../2_statements/statements/_statement";
import {IStructure} from "./structures/_structure";
import * as Structures from "./structures";
import {Issue} from "../../issue";
import {StructureNode, StatementNode} from "../nodes";
import {Position} from "../../position";
import {IStructureResult} from "./structure_result";
import {IStatementResult} from "../2_statements/statement_result";
import {IFile} from "../../files/_ifile";
import {Severity} from "../../severity";

export class StructureParser {

  public static run(input: IStatementResult): IStructureResult {
    const structure = this.findStructureForFile(input.file.getFilename());
// todo, comments and empty statements will not be part of the structure
// is this a problem? Plus unknowns
    const statements = input.statements.slice().filter((s) => {
      return !(s.get() instanceof StatementComment || s.get() instanceof Empty || s.get() instanceof Unknown);
    });
    return this.runFile(structure, input.file, statements);
  }

//////////////////

  private static findStructureForFile(filename: string): IStructure {
// todo, not sure this is the right place for this logic
    if (filename.match(/\.clas\.abap$/)) {
      return new Structures.ClassGlobal();
    } else if (filename.match(/\.intf\.abap$/)) {
      return new Structures.Interface();
    } else {
// todo
      return new Structures.Any();
    }
  }

  private static runFile(structure: IStructure, file: IFile, statements: StatementNode[]): {issues: Issue[], node?: StructureNode} {
    const parent = new StructureNode(structure);
    const result = structure.getMatcher().run(statements, parent);

    if (result.error) {
      const issue = Issue.atPosition(file, new Position(1, 1), result.errorDescription, "structure", Severity.Error);
      return {issues: [issue], node: undefined};
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.get().constructor.name.toUpperCase();
      const issue = Issue.atPosition(file, statement.getStart(), descr, "structure", Severity.Error);
      return {issues: [issue], node: undefined};
    }

    return {issues: [], node: parent};
  }

}