import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;

export class InsertReport extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = per(seq(str("STATE"), new Reuse.Source()),
                      seq(str("EXTENSION TYPE"), new Reuse.Source()),
                      seq(str("DIRECTORY ENTRY"), new Reuse.Source()),
                      seq(str("PROGRAM TYPE"), new Reuse.Source()),
                      str("KEEPING DIRECTORY ENTRY"));

    let ret = seq(str("INSERT REPORT"),
                  new Reuse.Source(),
                  str("FROM"),
                  new Reuse.Source(),
                  opt(options));

    return ret;
  }

}