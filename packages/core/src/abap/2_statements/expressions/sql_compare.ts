import {ver, seq, opt, tok, star, alt, optPrio, str, Expression} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLCompareOperator} from ".";
import {WParenLeft, WParenLeftW, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const val = new SQLSource();

    const list = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                     val,
                     star(seq(str(","), val)),
                     str(")"));

    const subSelect = seq(str("("), new Select(), str(")"));

    const inn = seq(opt(str("NOT")),
                    str("IN"),
                    alt(new SQLSource(), list, subSelect));

    const between = seq(str("BETWEEN"), new SQLSource(), str("AND"), new SQLSource());

    const like = seq(opt(str("NOT")), str("LIKE"), new SQLSource(), optPrio(seq(str("ESCAPE"), new SQLSource())));

    const nul = seq(str("IS"), opt(str("NOT")), str("NULL"));

    const source = new SQLSource();

    const sub = seq(opt(alt(str("ALL"), str("ANY"), str("SOME"))), subSelect);

    const builtin = ver(Version.v751, seq(alt(str("lower"), str("upper")), tok(ParenLeftW), new SQLFieldName(), tok(WParenRightW)));

    const rett = seq(alt(new SQLFieldName(), builtin),
                     alt(seq(new SQLCompareOperator(), alt(source, sub)),
                         inn,
                         like,
                         between,
                         nul));

    const ret = rett;

    const exists = seq(str("EXISTS"), subSelect);

    return alt(ret, new Dynamic(), exists);
  }
}