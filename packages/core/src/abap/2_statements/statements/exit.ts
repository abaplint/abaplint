import {IStatement} from "./_statement";
import {alts, opts, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("EXIT", opts(alts("FROM SQL", "FROM STEP-LOOP")));
  }

}