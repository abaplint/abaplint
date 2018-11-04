import {Statement} from "./_statement";
import {str, opt, seq, IRunnable} from "../combi";

export class Exit extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("EXIT"), opt(str("FROM STEP-LOOP")));
  }

}