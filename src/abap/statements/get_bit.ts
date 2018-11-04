import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class GetBit extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("GET BIT"),
                  new Source(),
                  str("OF"),
                  new Source(),
                  str("INTO"),
                  new Target());

    return ret;
  }

}