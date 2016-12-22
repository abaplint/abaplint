import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;

export class TopOfPage extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("TOP-OF-PAGE"),
               opt(str("DURING LINE-SELECTION")));
  }

}