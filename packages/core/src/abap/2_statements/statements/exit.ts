import {IStatement} from "./_statement";
import {alts, opt, seqs} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("EXIT", opt(alts("FROM SQL", "FROM STEP-LOOP")));
  }

}