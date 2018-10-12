import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, per, tok, regex as reg, IRunnable} from "../combi";
import {Target, Source, Dynamic, FieldSub} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft} from "../tokens/";
import {Version} from "../../version";

export class Write extends Statement {

  public get_matcher(): IRunnable {
    let at = seq(opt(str("AT")), reg(/^\/?\d+$/));

    let mask = seq(str("USING"),
                   alt(str("NO EDIT MASK"),
                       seq(str("EDIT MASK"), new Source())));

    let onoff = alt(alt(str("ON"), str("OFF")), seq(str("="), new FieldSub()));

    let to = seq(str("TO"), new Target());
    let options = per(mask,
                      to,
                      seq(str("EXPONENT"), new Source()),
                      str("NO-GROUPING"),
                      str("NO-ZERO"),
                      str("CENTERED"),
                      seq(str("INPUT"), opt(onoff)),
                      str("NO-GAP"),
                      str("LEFT-JUSTIFIED"),
                      str("AS LINE"),
                      str("AS ICON"),
                      seq(str("HOTSPOT"), opt(onoff)),
                      str("AS CHECKBOX"),
                      str("AS SYMBOL"),
                      str("RIGHT-JUSTIFIED"),
                      seq(str("TIME ZONE"), new Source()),
                      seq(str("UNDER"), new Source()),
                      seq(str("STYLE"), new Source()),
                      seq(str("ROUND"), new Source()),
                      seq(str("QUICKINFO"), new Source()),
                      str("ENVIRONMENT TIME FORMAT"),
                      reg(/^[YMD]{2,4}\/?[YMD]{2,4}\/?[YMD]{2,4}$/i),
                      seq(str("UNIT"), new Source()),
                      seq(str("INTENSIFIED"), opt(onoff)),
                      seq(str("DECIMALS"), new Source()),
                      seq(str("INVERSE"), opt(str("ON"))),
                      seq(str("COLOR"), opt(str("=")), new Source()),
                      seq(str("CURRENCY"), new Source()),
                      str("NO-SIGN"));

// todo, is AT just an optional token?
    let complex = alt(seq(str("/"), opt(seq(tok(ParenLeft), reg(/^\d+$/), tok(ParenRightW)))),
                      seq(opt(str("AT")), tok(WParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW)),
                      seq(opt(str("AT")), reg(/^\/?\d+$/), tok(ParenLeft), reg(/^\d+$/), tok(ParenRightW)),
                      seq(str("AT"), new FieldSub()),
                      seq(str("AT"), str("/"), tok(ParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW)));

    let ret = seq(str("WRITE"),
                  opt(alt(at, complex)),
                  opt(alt(new Source(), new Dynamic())),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}