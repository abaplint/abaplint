import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;

export class Exit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("EXIT"), opt(str("FROM STEP-LOOP")));
  }

}