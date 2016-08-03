import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class InsertReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("INSERT REPORT"),
                  Reuse.source(),
                  str("FROM"),
                  Reuse.source(),
                  opt(seq(str("STATE"), Reuse.source())),
                  opt(seq(str("PROGRAM TYPE"), Reuse.source())));

    return ret;
  }

}