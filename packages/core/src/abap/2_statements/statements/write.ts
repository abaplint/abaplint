import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alts, per, tok, regex as reg, altPrio} from "../combi";
import {Target, Source, Dynamic, FieldSub, FieldChain, Color} from "../expressions";
import {ParenLeft, ParenRightW, WParenLeft, ParenRight} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Write implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mask = seqs("USING",
                      alts("NO EDIT MASK",
                           seqs("EDIT MASK", Source)));

    const onOff = alts(alts("ON", "OFF"), seqs("=", FieldSub));

    const dateFormat = alts("DD/MM/YY",
                            "MM/DD/YY",
                            "DD/MM/YYYY",
                            "MM/DD/YYYY",
                            "DDMMYY",
                            "MMDDYY",
                            "YYMMDD");

    const to = seqs("TO", Target);
    const options = per(mask,
                        to,
                        seqs("EXPONENT", Source),
                        str("NO-GROUPING"),
                        str("NO-ZERO"),
                        str("CENTERED"),
                        seqs("INPUT", opt(onOff)),
                        str("NO-GAP"),
                        str("LEFT-JUSTIFIED"),
                        str("AS LINE"),
                        str("AS ICON"),
                        seqs("FRAMES", onOff),
                        seqs("HOTSPOT", opt(onOff)),
                        str("AS CHECKBOX"),
                        str("AS SYMBOL"),
                        str("RIGHT-JUSTIFIED"),
                        seqs("TIME ZONE", Source),
                        seqs("UNDER", Source),
                        seqs("STYLE", Source),
                        seqs("ROUND", Source),
                        seqs("QUICKINFO", Source),
                        str("ENVIRONMENT TIME FORMAT"),
                        dateFormat,
                        seqs("UNIT", Source),
                        seqs("INTENSIFIED", opt(onOff)),
                        seqs("INDEX", Source),
                        seqs("DECIMALS", Source),
                        seqs("INVERSE", opt(onOff)),
                        new Color(),
                        seqs("CURRENCY", Source),
                        str("NO-SIGN"));

    const post = seqs(alts(FieldChain, reg(/^[\d]+$/), reg(/^\*$/)), alts(tok(ParenRightW), tok(ParenRight)));
    const wlength = seqs(tok(WParenLeft), post);
    const length = seqs(tok(ParenLeft), post);

// todo, move to expression?
    const complex = alts(wlength,
                         seqs(alts(FieldChain, reg(/^\/?[\w\d]+$/), str("/")), opt(length)));

    const at = seqs(opt(str("AT")), complex);

    const ret = seqs("WRITE",
                     opt(at),
                     altPrio(new Source(), new Dynamic(), str("/")),
                     opt(options));

    return verNot(Version.Cloud, ret);
  }

}