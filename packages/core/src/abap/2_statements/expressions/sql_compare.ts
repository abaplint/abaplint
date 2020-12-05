import {ver, seqs, opt, tok, star, alt, optPrio, str, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seqs(alt(tok(WParenLeft), tok(WParenLeftW)),
                      val,
                      star(seqs(",", val)),
                      ")");

    const subSelect = seqs("(", Select, ")");

    const inn = seqs(opt(str("NOT")),
                     "IN",
                     alt(new SQLSource(), list, subSelect));

    const between = seqs("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seqs(opt(str("NOT")), "LIKE", SQLSource, optPrio(seqs("ESCAPE", SQLSource)));

    const nul = seqs("IS", opt(str("NOT")), alt(str("NULL"), ver(Version.v753, str("INITIAL"))));

    const source = new SQLSource();

    const sub = seqs(opt(alt(str("ALL"), str("ANY"), str("SOME"))), subSelect);

    const builtin = ver(Version.v751, seqs(alt(str("lower"), str("upper")), tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    const rett = seqs(alt(new SQLFieldName(), builtin),
                      alt(seqs(SQLCompareOperator, alt(source, sub)),
                          inn,
                          like,
                          between,
                          nul));

    const ret = rett;

    const exists = seqs("EXISTS", subSelect);

    return alt(ret, new Dynamic(), exists);
  }
}