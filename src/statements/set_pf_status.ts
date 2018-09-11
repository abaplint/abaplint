import {Statement} from "./statement";
import {str, seq, opt, per, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetPFStatus extends Statement {

  public static get_matcher(): IRunnable {
    let program = seq(str("OF PROGRAM"), new Source());

    let options = per(program,
                      str("IMMEDIATELY"),
                      seq(str("EXCLUDING"), new Source()));

    let ret = seq(str("SET PF-STATUS"),
                  new Source(),
                  opt(options));

    return ret;
  }

}