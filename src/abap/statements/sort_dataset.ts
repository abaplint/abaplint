import {Statement} from "./statement";
import {str, seq, alt, opt, plus, optPrio, IRunnable} from "../combi";
import {FieldSymbol, FieldSub, Dynamic} from "../expressions";

export class SortDataset extends Statement {

  public getMatcher(): IRunnable {
    let order = alt(str("ASCENDING"), str("DESCENDING"));

    let sel = alt(new FieldSub(),
                  new FieldSymbol(),
                  new Dynamic());

    let fields = plus(seq(sel, optPrio(order)));

    let by = seq(str("BY"), fields);

    return seq(str("SORT"), opt(by));
  }

}