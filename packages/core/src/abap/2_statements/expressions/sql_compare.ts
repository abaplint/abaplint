import {ver, seqs, opts, tok, star, alts, optPrio, str, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seqs(alts(tok(WParenLeft), tok(WParenLeftW)),
                      val,
                      star(seqs(",", val)),
                      ")");

    const subSelect = seqs("(", Select, ")");

    const inn = seqs(opts("NOT"),
                     "IN",
                     alts(SQLSource, list, subSelect));

    const between = seqs("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seqs(opts("NOT"), "LIKE", SQLSource, optPrio(seqs("ESCAPE", SQLSource)));

    const nul = seqs("IS", opts("NOT"), alts("NULL", ver(Version.v753, str("INITIAL"))));

    const source = new SQLSource();

    const sub = seqs(opts(alts("ALL", "ANY", "SOME")), subSelect);

    const builtin = ver(Version.v751, seqs(alts("lower", "upper"), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

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