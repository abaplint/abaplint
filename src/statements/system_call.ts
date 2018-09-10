import {Statement} from "./statement";
import {str, seq, regex as reg, plus, IRunnable} from "../combi";

export class SystemCall extends Statement {

  public static get_matcher(): IRunnable {
    let anyy = reg(/^.+$/);

    return seq(str("SYSTEM-CALL"),
               plus(anyy));
  }

}