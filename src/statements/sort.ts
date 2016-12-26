import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Sort extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let order = alt(str("ASCENDING"), str("DESCENDING"));

    let sel = alt(new Reuse.FieldSub(),
                  new Reuse.FieldSymbol(),
                  new Reuse.Dynamic());

    let fields = plus(seq(sel,
                          opt(order)));

    let by = seq(str("BY"),
                 alt(fields, new Reuse.Dynamic()));

    return seq(str("SORT"),
               new Reuse.Target(),
               opt(alt(str("STABLE"), order)),
               opt(by),
               opt(str("AS TEXT")));
  }

}