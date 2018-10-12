import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class SetBit extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("SET BIT"),
                  new Source(),
                  str("OF"),
                  new Target(),
                  opt(seq(str("TO"), new Source())));

    return ret;
  }

}