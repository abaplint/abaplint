import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("FUNCTION", Field);
  }

}