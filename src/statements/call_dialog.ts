import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;

export class CallDialog extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let values = seq(new Reuse.Target(), opt(seq(str("FROM"), new Reuse.Source())));
    let exporting = seq(str("EXPORTING"), plus(values));

    let ret = seq(str("CALL DIALOG"), new Reuse.Constant(), opt(exporting));

    return ret;
  }

}