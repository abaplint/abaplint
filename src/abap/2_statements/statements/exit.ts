import {IStatement} from "./_statement";
import {str, alt, opt, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class Exit implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("EXIT"), opt(alt(str("FROM SQL"), str("FROM STEP-LOOP"))));
  }

}