import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, tok, regex as reg, IStatementRunnable} from "../combi";
import {Target, Source, Dynamic, FieldSub} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft} from "../tokens/";
import {Version} from "../../version";

export class Write extends Statement {

  public getMatcher(): IStatementRunnable {
    const at = seq(opt(str("AT")), reg(/^\/?\d+$/));

    const mask = seq(str("USING"),
                     alt(str("NO EDIT MASK"),
                         seq(str("EDIT MASK"), new Source())));

    const onoff = alt(alt(str("ON"), str("OFF")), seq(str("="), new FieldSub()));

    const to = seq(str("TO"), new Target());
    const options = per(mask,
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
                        seq(str("INDEX"), new Source()),
                        seq(str("DECIMALS"), new Source()),
                        seq(str("INVERSE"), opt(onoff)),
                        seq(str("COLOR"), opt(str("=")), new Source()),
                        seq(str("CURRENCY"), new Source()),
                        str("NO-SIGN"));

    const wlength = seq(tok(WParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW));
    const length = seq(tok(ParenLeft), reg(/^[\w\d]+$/), tok(ParenRightW));

// todo, is AT just an optional token?
// todo, clean up
// todo, move to expression?
    const complex = alt(seq(str("/"), opt(length)),
                        seq(opt(str("AT")), wlength),
                        seq(opt(str("AT")), reg(/^\/?\d+$/), length),
                        seq(str("AT"), new FieldSub(), opt(length)),
                        seq(str("AT"), str("/"), length));

    const ret = seq(str("WRITE"),
                    opt(alt(at, complex)),
                    opt(alt(new Source(), new Dynamic())),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}