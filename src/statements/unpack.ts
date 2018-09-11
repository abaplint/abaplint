import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Unpack extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("UNPACK"),
               new Source(),
               str("TO"),
               new Target());
  }

}