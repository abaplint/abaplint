import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class CreateOLE extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CREATE OBJECT"),
                  new Target(),
                  new Reuse.Source(),
                  opt(str("NO FLUSH")),
                  opt(str("QUEUE-ONLY")));

    return ret;
  }

}