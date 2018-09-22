import {Statement} from "./statement";
import {str, seq, alt, per, opt, plus, optPrio, IRunnable} from "../combi";
import {FieldSymbol, Target, FieldSub, Dynamic} from "../expressions";

export class Sort extends Statement {

  public static get_matcher(): IRunnable {
    let order = alt(str("ASCENDING"), str("DESCENDING"));

    let sel = alt(new FieldSub(),
                  new FieldSymbol(),
                  new Dynamic());

    let fields = plus(seq(sel, optPrio(order)));

    let by = seq(str("BY"), fields);

    let target = seq(new Target(),
                     opt(per(order, by, str("STABLE"), str("AS TEXT"))));

    return seq(str("SORT"),
               alt(by, target));
  }

}