import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Events extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let exporting = seq(str("EXPORTING"), plus(new Reuse.MethodParam()));

    return seq(alt(str("CLASS-EVENTS"), str("EVENTS")), new Reuse.Field(), opt(exporting));
  }

}