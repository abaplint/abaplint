import {Unknown, Empty, Comment as StatementComment} from "../2_statements/statements/_statement";
import {IStructure} from "../3_structures/structures/_structure";
import * as Structures from "../3_structures/structures";
import {Issue} from "../../issue";
import {StructureNode, StatementNode} from "../nodes/";
import {Position} from "../../position";
import {IStructureResult} from "./structure_result";
import {IStatementResult} from "../2_statements/statement_result";
import {IFile} from "../../files/_ifile";

export class StructureParser {

  public static run(input: IStatementResult): IStructureResult {
    const structure = this.findStructureForFile(input.file.getFilename());
// todo, comments and empty statements will not be part of the structure
// is this a problem?
    const statements = input.statements.slice().filter((s) => {
      return !(s.get() instanceof StatementComment || s.get() instanceof Empty);
    });
    const unknowns = input.statements.slice().filter((s) => { return s.get() instanceof Unknown; });
    if (unknowns.length > 0) {
// do not parse structure, file contains unknown statements(parser errors)
      return {issues: [], node: undefined};
    }
    return this.runFile(structure, input.file, statements);
  }

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
      const issue = Issue.atPosition(file, new Position(1, 1), result.errorDescription, "structure");
      return {issues: [issue], node: undefined};
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.get().constructor.name.toUpperCase();
      const issue = Issue.atPosition(file, statement.getStart(), descr, "structure");
      return {issues: [issue], node: undefined};
    }

    return {issues: [], node: parent};
  }

}