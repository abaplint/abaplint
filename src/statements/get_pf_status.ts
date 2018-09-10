import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetPFStatus extends Statement {

  public static get_matcher(): IRunnable {
    let program = seq(str("PROGRAM"), new Reuse.Source());
    let excl = seq(str("EXCLUDING"), new Reuse.Source());

    let ret = seq(str("GET PF-STATUS"),
                  new Target(),
                  opt(program),
                  opt(excl));

    return ret;
  }

}