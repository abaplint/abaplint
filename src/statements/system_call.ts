import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;
let plus = Combi.plus;

export class SystemCall extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let anyy = reg(/^.+$/);

    return seq(str("SYSTEM-CALL"),
               plus(anyy));
  }

}