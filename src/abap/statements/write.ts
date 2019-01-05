import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, tok, regex as reg, IStatementRunnable} from "../combi";
import {Target, Source, Dynamic, FieldSub, FieldChain} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft} from "../tokens/";
import {Version} from "../../version";

export class Write extends Statement {

  public getMatcher(): IStatementRunnable {

    const mask = seq(str("USING"),
                     alt(str("NO EDIT MASK"),
                         seq(str("EDIT MASK"), new Source())));

    const onOff = alt(alt(str("ON"), str("OFF")), seq(str("="), new FieldSub()));

    const to = seq(str("TO"), new Target());
    const options = per(mask,
                        to,
                        seq(str("EXPONENT"), new Source()),
                        str("NO-GROUPING"),
                        str("NO-ZERO"),
                        str("CENTERED"),
                        seq(str("INPUT"), opt(onOff)),
                        str("NO-GAP"),
                        str("LEFT-JUSTIFIED"),
                        str("AS LINE"),
                        str("AS ICON"),
                        seq(str("FRAMES"), onOff),
                        seq(str("HOTSPOT"), opt(onOff)),
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
                        seq(str("INTENSIFIED"), opt(onOff)),
                        seq(str("INDEX"), new Source()),
                        seq(str("DECIMALS"), new Source()),
                        seq(str("INVERSE"), opt(onOff)),
                        seq(str("COLOR"), opt(str("=")), new Source()),
                        seq(str("CURRENCY"), new Source()),
                        str("NO-SIGN"));

    const post = seq(alt(reg(/^[\w\d]+$/), reg(/^\*$/)), tok(ParenRightW));
    const wlength = seq(tok(WParenLeft), post);
    const length = seq(tok(ParenLeft), post);

// todo, move to expression?
    const complex = alt(wlength,
                        seq(alt(new FieldChain(), reg(/^\/?[\w\d]+$/), str("/")), opt(length)));

    const at = seq(opt(str("AT")), complex);

    const ret = seq(str("WRITE"),
                    opt(at),
                    opt(alt(new Source(), new Dynamic())),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}