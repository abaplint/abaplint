import {IStructureRunnable} from "./_combi";
import {StructureNode, StatementNode} from "../nodes/";
import {Issue} from "../../issue";
import {ABAPFile} from "../../files";
import {Position} from "../../position";

// todo, this should also have an interface
export abstract class Structure  {
  public abstract getMatcher(): IStructureRunnable;

  public runFile(file: ABAPFile, statements?: StatementNode[]): {issues: Issue[], node?: StructureNode} {
    statements = statements ? statements : file.getStatements();

    const parent = new StructureNode(this);
    const result = this.getMatcher().run(statements, parent);

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