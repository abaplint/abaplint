import {Statement} from "./_statement";
import {str, opt, seq, IStatementRunnable} from "../combi";

export class Exit extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("EXIT"), opt(str("FROM STEP-LOOP")));
  }

}