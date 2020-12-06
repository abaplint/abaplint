import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, per, tok, regex as reg, altPrio} from "../combi";
import {Target, Source, Dynamic, FieldSub, FieldChain, Color} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft, ParenRight} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Write implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mask = seq("USING",
                     alt("NO EDIT MASK",
                         seq("EDIT MASK", Source)));

    const onOff = alt(alt("ON", "OFF"), seq("=", FieldSub));

    const dateFormat = alt("DD/MM/YY",
                           "MM/DD/YY",
                           "DD/MM/YYYY",
                           "MM/DD/YYYY",
                           "DDMMYY",
                           "MMDDYY",
                           "YYMMDD");

    const to = seq("TO", Target);
    const options = per(mask,
                        to,
                        seq("EXPONENT", Source),
                        "NO-GROUPING",
                        "NO-ZERO",
                        "CENTERED",
                        seq("INPUT", opt(onOff)),
                        "NO-GAP",
                        "LEFT-JUSTIFIED",
                        "AS LINE",
                        "AS ICON",
                        seq("FRAMES", onOff),
                        seq("HOTSPOT", opt(onOff)),
                        "AS CHECKBOX",
                        "AS SYMBOL",
                        "RIGHT-JUSTIFIED",
                        seq("TIME ZONE", Source),
                        seq("UNDER", Source),
                        seq("STYLE", Source),
                        seq("ROUND", Source),
                        seq("QUICKINFO", Source),
                        "ENVIRONMENT TIME FORMAT",
                        dateFormat,
                        seq("UNIT", Source),
                        seq("INTENSIFIED", opt(onOff)),
                        seq("INDEX", Source),
                        seq("DECIMALS", Source),
                        seq("INVERSE", opt(onOff)),
                        Color,
                        seq("CURRENCY", Source),
                        "NO-SIGN");

    const post = seq(alt(FieldChain, reg(/^[\d]+$/), reg(/^\*$/)), alt(tok(ParenRightW), tok(ParenRight)));
    const wlength = seq(tok(WParenLeft), post);
    const length = seq(tok(ParenLeft), post);

// todo, move to expression?
    const complex = alt(wlength,
                        seq(alt(FieldChain, reg(/^\/?[\w\d]+$/), "/"), opt(length)));

    const at = seq(opt("AT"), complex);

    const ret = seq("WRITE",
                    opt(at),
                    altPrio(Source, Dynamic, "/"),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}