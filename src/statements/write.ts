import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;
let tok = Combi.tok;
let reg = Combi.regex;

export class Write extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let at = seq(opt(str("AT")), reg(/^\/?\d+$/));

    let mask = seq(str("USING EDIT MASK"), new Reuse.Source());

    let to = seq(str("TO"), new Reuse.Target());

    let options = per(mask,
                      to,
                      str("EXPONENT 0"),
                      str("NO-GROUPING"),
                      str("NO-ZERO"),
                      str("LEFT-JUSTIFIED"),
                      seq(str("UNIT"), new Reuse.Source()),
                      seq(str("DECIMALS"), new Reuse.Source()),
                      seq(str("COLOR"), opt(str("=")), new Reuse.Source(), opt(str("INVERSE"))),
                      seq(str("CURRENCY"), new Reuse.Source()),
                      str("NO-SIGN"));

    let complex = seq(str("/"), opt(seq(tok("ParenLeft"), reg(/^\d+$/), tok("ParenRightW"))));

    let ret = seq(str("WRITE"),
                  opt(alt(at, complex)),
                  opt(new Reuse.Source()),
                  opt(options));

    return ret;
  }

}