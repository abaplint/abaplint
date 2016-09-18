import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let per = Combi.per;
let alt = Combi.alt;
let plus = Combi.plus;

export class Submit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let awith = seq(str("WITH"), new Reuse.Field(), str("="), new Reuse.Source());
    let prog = alt(new Reuse.Source(), new Reuse.Dynamic());
    let perm = per(plus(awith), str("AND RETURN"));
    let ret = seq(str("SUBMIT"), prog, opt(str("VIA SELECTION-SCREEN")), opt(perm));
    return ret;
  }

}