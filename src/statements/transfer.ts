import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";

export class Transfer extends Statement {

  public static get_matcher(): IRunnable {
    let length = seq(str("LENGTH"),
                     new Reuse.Source());

    let ret = seq(str("TRANSFER"),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.Target(),
                  opt(length));

    return ret;
  }

}