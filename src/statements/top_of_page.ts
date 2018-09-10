import {Statement} from "./statement";
import {str, opt, seq, IRunnable} from "../combi";

export class TopOfPage extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("TOP-OF-PAGE"),
               opt(str("DURING LINE-SELECTION")));
  }

}