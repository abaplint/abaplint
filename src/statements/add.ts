import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Add extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ADD"),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.Target());

    return ret;
  }

}