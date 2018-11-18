import {IStructureRunnable} from "./_combi";
import {StructureNode, StatementNode} from "../nodes/";
import {Issue} from "../../issue";
import {ABAPFile} from "../../files";

// todo, this should also have an interface
export abstract class Structure  {
  public abstract getMatcher(): IStructureRunnable;

  public runFile(file: ABAPFile, statements?: StatementNode[]): {issues: Issue[], node?: StructureNode} {
    statements = statements ? statements : file.getStatements();

    const parent = new StructureNode(this);
    const result = this.getMatcher().run(statements, parent);

    if (result.error) {
      return {issues: [new Issue({file, code: "structure", message: result.errorDescription})], node: undefined};
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.get().constructor.name.toUpperCase();
      return {issues: [new Issue({file, message: descr, code: "structure", start: statement.getStart()})], node: undefined};
    }

    return {issues: [], node: parent};
  }

}