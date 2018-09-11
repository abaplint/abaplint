import {Statement} from "./statement";
import {str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class GetPFStatus extends Statement {

  public static get_matcher(): IRunnable {
    let program = seq(str("PROGRAM"), new Source());
    let excl = seq(str("EXCLUDING"), new Source());

    let ret = seq(str("GET PF-STATUS"),
                  new Target(),
                  opt(program),
                  opt(excl));

    return ret;
  }

}