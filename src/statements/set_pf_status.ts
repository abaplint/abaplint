import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, per, IRunnable} from "../combi";

export class SetPFStatus extends Statement {

  public static get_matcher(): IRunnable {
    let program = seq(str("OF PROGRAM"), new Reuse.Source());

    let options = per(program,
                      str("IMMEDIATELY"),
                      seq(str("EXCLUDING"), new Reuse.Source()));

    let ret = seq(str("SET PF-STATUS"),
                  new Reuse.Source(),
                  opt(options));

    return ret;
  }

}