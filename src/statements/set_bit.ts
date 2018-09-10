import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class SetBit extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET BIT"),
                  new Reuse.Source(),
                  str("OF"),
                  new Target(),
                  opt(seq(str("TO"), new Reuse.Source())));

    return ret;
  }

}