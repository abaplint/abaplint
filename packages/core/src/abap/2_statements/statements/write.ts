import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per, tok, regex as reg, altPrio} from "../combi";
import {Target, Source, Dynamic, FieldSub, FieldChain} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Write implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mask = seq(str("USING"),
                     alt(str("NO EDIT MASK"),
                         seq(str("EDIT MASK"), new Source())));

    const onOff = alt(alt(str("ON"), str("OFF")), seq(str("="), new FieldSub()));

    const dateFormat = alt(str("DD/MM/YY"),
                           str("MM/DD/YY"),
                           str("DD/MM/YYYY"),
                           str("MM/DD/YYYY"),
                           str("DDMMYY"),
                           str("MMDDYY"),
                           str("YYMMDD"));

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
                        dateFormat,
                        seq(str("UNIT"), new Source()),
                        seq(str("INTENSIFIED"), opt(onOff)),
                        seq(str("INDEX"), new Source()),
                        seq(str("DECIMALS"), new Source()),
                        seq(str("INVERSE"), opt(onOff)),
                        seq(str("COLOR"), opt(str("=")), new Source()),
                        seq(str("CURRENCY"), new Source()),
                        str("NO-SIGN"));

    const post = seq(alt(new FieldChain(), reg(/^[\d]+$/), reg(/^\*$/)), tok(ParenRightW));
    const wlength = seq(tok(WParenLeft), post);
    const length = seq(tok(ParenLeft), post);

// todo, move to expression?
    const complex = alt(wlength,
                        seq(alt(new FieldChain(), reg(/^\/?[\w\d]+$/), str("/")), opt(length)));

    const at = seq(opt(str("AT")), complex);

    const ret = seq(str("WRITE"),
                    opt(at),
                    altPrio(new Source(), new Dynamic(), str("/")),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}