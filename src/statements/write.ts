import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";
import {ParenLeft, ParenRightW, WParenLeft} from "../tokens/";

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

    let mask = seq(str("USING"),
                   alt(str("NO EDIT MASK"),
                       seq(str("EDIT MASK"), new Reuse.Source())));

    let to = seq(str("TO"), new Reuse.Target());

    let colorOpt = alt(seq(str("INVERSE"), opt(str("ON"))),
                       seq(str("INTENSIFIED"), opt(str("ON"))));

    let options = per(mask,
                      to,
                      seq(str("EXPONENT"), new Reuse.Source()),
                      str("NO-GROUPING"),
                      str("NO-ZERO"),
                      str("CENTERED"),
                      seq(str("INPUT"), opt(alt(str("ON"), str("OFF")))),
                      str("NO-GAP"),
                      str("LEFT-JUSTIFIED"),
                      str("AS LINE"),
                      str("AS ICON"),
                      seq(str("HOTSPOT"), opt(alt(str("ON"), str("OFF")))),
                      str("AS CHECKBOX"),
                      str("AS SYMBOL"),
                      str("RIGHT-JUSTIFIED"),
                      seq(str("TIME ZONE"), new Reuse.Source()),
                      seq(str("UNDER"), new Reuse.Source()),
                      seq(str("STYLE"), new Reuse.Source()),
                      seq(str("ROUND"), new Reuse.Source()),
                      seq(str("QUICKINFO"), new Reuse.Source()),
                      str("ENVIRONMENT TIME FORMAT"),
                      reg(/^[YMD]{2,4}\/?[YMD]{2,4}\/?[YMD]{2,4}$/i),
                      seq(str("UNIT"), new Reuse.Source()),
                      str("INTENSIFIED OFF"),
                      seq(str("DECIMALS"), new Reuse.Source()),
                      seq(str("COLOR"), opt(str("=")), new Reuse.Source(), opt(colorOpt)),
                      seq(str("CURRENCY"), new Reuse.Source()),
                      str("NO-SIGN"));

    let complex = alt(seq(str("/"), opt(seq(tok(ParenLeft), reg(/^\d+$/), tok(ParenRightW)))),
                      seq(opt(str("AT")), tok(WParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW)),
                      seq(reg(/^\/?\d+$/), tok(ParenLeft), reg(/^\d+$/), tok(ParenRightW)),
                      seq(str("AT"), str("/"), tok(ParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW)));

    let ret = seq(str("WRITE"),
                  opt(alt(at, complex)),
                  opt(alt(new Reuse.Source(), new Reuse.Dynamic())),
                  opt(options));

    return ret;
  }

}