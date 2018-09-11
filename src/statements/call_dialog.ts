import {Statement} from "./statement";
import {str, seq, opt, plus, optPrio, IRunnable} from "../combi";
import {Field, FieldSub, Constant} from "../expressions";

export class CallDialog extends Statement {

  public static get_matcher(): IRunnable {
    let from = seq(new FieldSub(), optPrio(seq(str("FROM"), new Field())));
    let exporting = seq(str("EXPORTING"), plus(from));

    let to = seq(new Field(), optPrio(seq(str("TO"), new Field())));
    let importing = seq(str("IMPORTING"), plus(to));

    let ret = seq(str("CALL DIALOG"),
                  new Constant(),
                  opt(exporting),
                  opt(importing));

    return ret;
  }

}