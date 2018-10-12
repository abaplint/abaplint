import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class GetBit extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("GET BIT"),
                  new Source(),
                  str("OF"),
                  new Source(),
                  str("INTO"),
                  new Target());

    return ret;
  }

}