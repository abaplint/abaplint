import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ElseIf implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("ELSEIF", Cond);
  }

}