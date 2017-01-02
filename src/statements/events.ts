import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let plus = Combi.plus;
let opt = Combi.opt;

export class Events extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let exporting = seq(str("EXPORTING"), plus(new Reuse.MethodParam()));

    return seq(str("EVENTS"), new Reuse.Field(), opt(exporting));
  }

}