import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class ModifyDatabase extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(new Reuse.DatabaseTable(), new Reuse.Dynamic());

    let ret = seq(str("MODIFY"),
                  target,
                  alt(seq(str("FROM"), opt(str("TABLE")), new Reuse.Source()),
                      str("CLIENT SPECIFIED")));

    return ret;
  }

}