import {Statement} from "./statement";
import {str, opt, seq, IRunnable} from "../combi";

export class Exit extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("EXIT"), opt(str("FROM STEP-LOOP")));
  }

}