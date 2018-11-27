import {seq, opt, tok, star, alt, optPrio, str, Expression, IStatementRunnable} from "../combi";
import {SQLFieldName, Dynamic, Select} from "./";
import {WParenLeft, WParenLeftW} from "../tokens/";
import {SQLSource} from "./sql_source";

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

    const operator = alt(str("="),
                         str("<>"),
                         str("><"),
                         str("<"),
                         str(">"),
                         str("<="),
                         str("=>"),
                         str(">="),
                         str("EQ"),
                         str("NE"),
                         str("GE"),
                         str("GT"),
                         str("LT"),
                         str("LE"));

    const between = seq(str("BETWEEN"), new SQLSource(), str("AND"), new SQLSource());

    const like = seq(opt(str("NOT")), str("LIKE"), new SQLSource(), optPrio(seq(str("ESCAPE"), new SQLSource())));

    const nul = seq(str("IS"), opt(str("NOT")), str("NULL"));

    const source = new SQLSource();

    const sub = seq(opt(alt(str("ALL"), str("ANY"), str("SOME"))), subSelect);

    const rett = seq(new SQLFieldName(),
                     alt(seq(operator, alt(source, sub)),
                         inn,
                         like,
                         between,
                         nul));

    const ret = rett;

    const exists = seq(str("EXISTS"), subSelect);

    return alt(ret, new Dynamic(), exists);
  }
}