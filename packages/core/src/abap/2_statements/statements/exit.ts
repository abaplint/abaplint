import {IStatement} from "./_statement";
import {alt, opts, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("EXIT", opts(alt("FROM SQL", "FROM STEP-LOOP")));
  }

}