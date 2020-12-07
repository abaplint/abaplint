import {IStatement} from "./_statement";
import {alt, opt, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("EXIT", opt(alt("FROM SQL", "FROM STEP-LOOP")));
  }

}