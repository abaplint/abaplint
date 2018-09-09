import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, plus, optPrio, IRunnable} from "../combi";

export class CallDialog extends Statement {

  public static get_matcher(): IRunnable {
    let from = seq(new Reuse.FieldSub(), optPrio(seq(str("FROM"), new Reuse.Field())));
    let exporting = seq(str("EXPORTING"), plus(from));

    let to = seq(new Reuse.Field(), optPrio(seq(str("TO"), new Reuse.Field())));
    let importing = seq(str("IMPORTING"), plus(to));

    let ret = seq(str("CALL DIALOG"),
                  new Reuse.Constant(),
                  opt(exporting),
                  opt(importing));

    return ret;
  }

}