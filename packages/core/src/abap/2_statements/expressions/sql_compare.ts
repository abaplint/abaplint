import {vers, seqs, opts, tok, stars, alts, optPrios, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seqs(alts(tok(WParenLeft), tok(WParenLeftW)), val, stars(seqs(",", val)), ")");

    const subSelect = seqs("(", Select, ")");

    const inn = seqs(opts("NOT"),
                     "IN",
                     alts(SQLSource, list, subSelect));

    const between = seqs("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seqs(opts("NOT"), "LIKE", SQLSource, optPrios(seqs("ESCAPE", SQLSource)));

    const nul = seqs("IS", opts("NOT"), alts("NULL", vers(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seqs(opts(alts("ALL", "ANY", "SOME")), subSelect);

    const builtin = vers(Version.v751, seqs(alts("lower", "upper"), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    const rett = seqs(alts(SQLFieldName, builtin),
                      alts(seqs(SQLCompareOperator, alts(source, sub)),
                           inn,
                           like,
                           between,
                           nul));

    const ret = rett;

    const exists = seqs("EXISTS", subSelect);

    return alts(ret, Dynamic, exists);
  }
}