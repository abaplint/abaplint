import {Statement} from "./_statement";
import {str, alt, opt, seq, IStatementRunnable} from "../combi";

export class Exit extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("EXIT"), opt(alt(str("FROM SQL"), str("FROM STEP-LOOP"))));
  }

}