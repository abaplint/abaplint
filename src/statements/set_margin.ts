import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetMargin extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET MARGIN"),
                  new Reuse.Source(),
                  new Reuse.Source());

    return ret;
  }

}