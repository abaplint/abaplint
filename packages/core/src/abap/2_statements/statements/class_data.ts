import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {DataDefinition} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassData implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CLASS-DATA", DataDefinition);
  }

}