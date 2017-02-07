import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;
let optPrio = Combi.optPrio;

export class CallDialog extends Statement {

  public static get_matcher(): Combi.IRunnable {
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