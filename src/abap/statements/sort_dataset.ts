import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, plus, optPrio, IRunnable} from "../combi";
import {FieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../version";

export class SortDataset extends Statement {

  public getMatcher(): IRunnable {
    let order = alt(str("ASCENDING"), str("DESCENDING"));

    let sel = alt(new FieldSub(),
                  new FieldSymbol(),
                  new Dynamic());

    let fields = plus(seq(sel, optPrio(order)));

    let by = seq(str("BY"), fields);

    let ret = seq(str("SORT"), opt(by));

    return verNot(Version.Cloud, ret);
  }

}