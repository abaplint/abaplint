import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;
let reg = Combi.regex;

export class Write extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let at = seq(opt(str("AT")), reg(/^\/?\d+$/));

    let mask = seq(str("USING EDIT MASK"), Reuse.source());

    let to = seq(str("TO"), Reuse.target());

    let options = per(mask,
                      to,
                      str("EXPONENT 0"),
                      str("NO-GROUPING"),
                      str("NO-ZERO"),
                      str("LEFT-JUSTIFIED"),
                      seq(str("UNIT"), Reuse.source()),
                      seq(str("DECIMALS"), Reuse.source()),
                      seq(str("COLOR"), Reuse.source()),
                      seq(str("CURRENCY"), Reuse.source()),
                      str("NO-SIGN"));

    let ret = seq(str("WRITE"),
                  opt(alt(at, str("/"))),
                  opt(Reuse.source()),
                  opt(options));

    return ret;
  }

}