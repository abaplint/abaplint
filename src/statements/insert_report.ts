import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class InsertReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("INSERT REPORT"),
                  new Reuse.Source(),
                  str("FROM"),
                  new Reuse.Source(),
                  opt(seq(str("STATE"), new Reuse.Source())),
                  opt(seq(str("EXTENSION TYPE"), new Reuse.Source())),
                  opt(seq(str("PROGRAM TYPE"), new Reuse.Source())));

    return ret;
  }

}