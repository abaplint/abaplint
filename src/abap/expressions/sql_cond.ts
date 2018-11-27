import {str, alt, seq, optPrio, star, tok, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenRightW, WParenRight} from "../tokens/";
import {SQLCompare} from "./";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt(str("AND"), str("OR"));

    const paren = seq(tok(WParenLeftW),
                      new SQLCond(),
                      alt(tok(WParenRightW), tok(WParenRight)));

    const cnd = seq(optPrio(str("NOT")), alt(new SQLCompare(), paren));

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}