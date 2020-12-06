import {IStatement} from "./_statement";
import {verNot, seqs, opts, alts, pers, tok, regex as reg, altPrios} from "../combi";
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
    const options = pers(mask,
                         to,
                         seqs("EXPONENT", Source),
                         "NO-GROUPING",
                         "NO-ZERO",
                         "CENTERED",
                         seqs("INPUT", opts(onOff)),
                         "NO-GAP",
                         "LEFT-JUSTIFIED",
                         "AS LINE",
                         "AS ICON",
                         seqs("FRAMES", onOff),
                         seqs("HOTSPOT", opts(onOff)),
                         "AS CHECKBOX",
                         "AS SYMBOL",
                         "RIGHT-JUSTIFIED",
                         seqs("TIME ZONE", Source),
                         seqs("UNDER", Source),
                         seqs("STYLE", Source),
                         seqs("ROUND", Source),
                         seqs("QUICKINFO", Source),
                         "ENVIRONMENT TIME FORMAT",
                         dateFormat,
                         seqs("UNIT", Source),
                         seqs("INTENSIFIED", opts(onOff)),
                         seqs("INDEX", Source),
                         seqs("DECIMALS", Source),
                         seqs("INVERSE", opts(onOff)),
                         Color,
                         seqs("CURRENCY", Source),
                         "NO-SIGN");

    const post = seqs(alts(FieldChain, reg(/^[\d]+$/), reg(/^\*$/)), alts(tok(ParenRightW), tok(ParenRight)));
    const wlength = seqs(tok(WParenLeft), post);
    const length = seqs(tok(ParenLeft), post);

// todo, move to expression?
    const complex = alts(wlength,
                         seqs(alts(FieldChain, reg(/^\/?[\w\d]+$/), "/"), opts(length)));

    const at = seqs(opts("AT"), complex);

    const ret = seqs("WRITE",
                     opts(at),
                     altPrios(Source, Dynamic, "/"),
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}