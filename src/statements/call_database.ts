import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT} from "../expressions";

export class CallDatabase extends Statement {

  public static get_matcher(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let expl = seq(opt(exporting), opt(importing));

    let tab = seq(str("PARAMETER-TABLE"), new Source());

    let connection = seq(str("CONNECTION"), new Dynamic());

    let ret = seq(str("CALL DATABASE PROCEDURE"),
                  new Dynamic(),
                  opt(connection),
                  alt(expl, tab));

    return ret;
  }

}