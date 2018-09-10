import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetBit extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET BIT"),
                  new Reuse.Source(),
                  str("OF"),
                  new Reuse.Source(),
                  str("INTO"),
                  new Target());

    return ret;
  }

}