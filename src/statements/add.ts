import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Target} from "../expressions";

export class Add extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ADD"),
                  new Reuse.Source(),
                  str("TO"),
                  new Target());

    return ret;
  }

}