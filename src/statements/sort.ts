import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Sort extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let order = alt(str("ASCENDING"), str("DESCENDING"));

    let fields = plus(seq(alt(Reuse.field_sub(), Reuse.field_symbol()),
                          opt(order),
                          opt(str("AS TEXT"))));

    let by = seq(str("BY"),
                 alt(fields, Reuse.dynamic()));

    return seq(str("SORT"),
               Reuse.target(),
               opt(alt(str("STABLE"), order)),
               opt(by));
  }

}