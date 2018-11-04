import {IStructureRunnable} from "./_combi";
import {StructureNode} from "../node";
import {Statement} from "../statements/_statement";
import {Issue} from "../../issue";
import {GenericError} from "../../rules";
import {ABAPFile} from "../../files";

export abstract class Structure extends StructureNode {
  public abstract getMatcher(): IStructureRunnable;

  public runFile(file: ABAPFile, statements?: Statement[]): {issues: Array<Issue>, node: StructureNode} {
    statements = statements ? statements : file.getStatements();

    const result = this.getMatcher().run(statements, this);

    if (result.error) {
      return {issues: [new Issue({rule: new GenericError(result.errorDescription), file, message: 1})], node: undefined};
    }
    if (result.unmatched.length > 0) {
      const statement = result.unmatched[0];
      const descr = "Unexpected " + statement.constructor.name.toUpperCase();
      return {issues: [new Issue({rule: new GenericError(descr), file, message: 1, start: statement.getStart()})], node: undefined};
    }

    return {issues: [], node: this};
  }

}