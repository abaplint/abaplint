import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class LoadReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("LOAD REPORT"),
                  new Reuse.Source(),
                  str("PART"),
                  new Reuse.Source(),
                  str("INTO"),
                  new Reuse.Target());

    return ret;
  }

}