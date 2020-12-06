import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("TEST-INJECTION", Field);
  }

}