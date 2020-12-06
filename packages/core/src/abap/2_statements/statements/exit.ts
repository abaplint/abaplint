import {IStatement} from "./_statement";
import {alts, opts, seqs} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("EXIT", opts(alts("FROM SQL", "FROM STEP-LOOP")));
  }

}