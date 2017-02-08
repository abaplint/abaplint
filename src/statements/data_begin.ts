import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class DataBegin extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let occurs = seq(str("OCCURS"), new Reuse.Integer());

    let structure = seq(str("BEGIN OF"),
                        opt(str("COMMON PART")),
                        new Reuse.NamespaceSimpleName(),
                        opt(occurs));

    return seq(start, structure);
  }

}