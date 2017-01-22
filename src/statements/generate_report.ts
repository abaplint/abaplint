import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;

export class GenerateReport extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let without = str("WITHOUT SELECTION-SCREEN");
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let include = seq(str("INCLUDE"), new Reuse.Target());
    let line = seq(str("LINE"), new Reuse.Target());
    let word = seq(str("WORD"), new Reuse.Target());
    let offset = seq(str("OFFSET"), new Reuse.Target());
    let headers = str("WITH PRECOMPILED HEADERS");
    let test = str("WITH TEST CODE");

    let options = per(without, message, include, line, word, offset, headers, test);

    let ret = seq(str("GENERATE REPORT"),
                  new Reuse.Source(),
                  opt(options));

    return ret;
  }

}