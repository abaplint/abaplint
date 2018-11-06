import {IStructureRunnable} from "./_combi";
import {StructureNode, StatementNode} from "../nodes/";
import {Issue} from "../../issue";
import {GenericError} from "../../rules";
import {ABAPFile} from "../../files";

// todo, this should also have an interface
export abstract class Structure  {
  public abstract getMatcher(): IStructureRunnable;

  public runFile(file: ABAPFile, statements?: StatementNode[]): {issues: Array<Issue>, node: StructureNode} {
    statements = statements ? statements : file.getStatements();

    let parent = new StructureNode(this);
    const result = this.getMatcher().run(statements, parent);

    if (result.error) {
      return {issues: [new Issue({rule: new GenericError(result.errorDescription), file, message: 1})], node: undefined};
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.get().constructor.name.toUpperCase();
      return {issues: [new Issue({rule: new GenericError(descr), file, message: 1, start: statement.getStart()})], node: undefined};
    }

    return {issues: [], node: parent};
  }

}