import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class FetchNext extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let size = seq(str("PACKAGE SIZE"), new Reuse.Source());

    let table = seq(alt(str("INTO"), str("APPENDING")),
                    opt(str("CORRESPONDING FIELDS OF")),
                    str("TABLE"),
                    new Reuse.Target());

    let record = seq(str("INTO"),
                     opt(str("CORRESPONDING FIELDS OF")),
                     new Reuse.Target());

    let ret = seq(str("FETCH NEXT CURSOR"),
                  new Reuse.Source(),
                  alt(record, table),
                  opt(size));

    return ret;
  }

}