import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class CreateOLE extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CREATE OBJECT"),
                  new Target(),
                  new Source(),
                  opt(str("NO FLUSH")),
                  opt(str("QUEUE-ONLY")));

    return ret;
  }

}