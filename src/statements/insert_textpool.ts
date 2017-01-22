import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class InsertTextpool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let state = seq(str("STATE"), new Reuse.Source());

    let ret = seq(str("INSERT TEXTPOOL"),
                  new Reuse.Source(),
                  str("FROM"),
                  new Reuse.Source(),
                  str("LANGUAGE"),
                  new Reuse.Source(),
                  opt(state));

    return ret;
  }

}