import {seq, opt, tok, star, alt, optPrio, str, Expression, IRunnable} from "../combi";
import {SQLFieldName, Dynamic, Select} from "./";
import {WParenLeft, WParenLeftW} from "../tokens/";
import {SQLSource} from "./sql_source";

export class SQLCompare extends Expression {
  public getRunnable(): IRunnable {
    let val = new SQLSource();

    let list = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                   val,
                   star(seq(str(","), val)),
                   str(")"));

    let subSelect = seq(str("("), new Select(), str(")"));

    let inn = seq(opt(str("NOT")),
                  str("IN"),
                  alt(new SQLSource(), list, subSelect));

    let operator = alt(str("="),
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

    let between = seq(str("BETWEEN"), new SQLSource(), str("AND"), new SQLSource());

    let like = seq(opt(str("NOT")), str("LIKE"), new SQLSource(), optPrio(seq(str("ESCAPE"), new SQLSource())));

    let nul = seq(str("IS"), opt(str("NOT")), str("NULL"));

    let source = new SQLSource();

    let sub = seq(opt(alt(str("ALL"), str("ANY"), str("SOME"))), subSelect);

    let rett = seq(new SQLFieldName(),
                   alt(seq(operator, alt(source, sub)),
                       inn,
                       like,
                       between,
                       nul));

    let ret = rett;

    let exists = seq(str("EXISTS"), subSelect);

    return alt(ret, new Dynamic(), exists);
  }
}