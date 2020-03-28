import {str, alt, seq, optPrio, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt(str("AND"), str("OR"));

    const paren = seq(tok(WParenLeftW),
                      new SQLCond(),
                      tok(WParenRightW));

    const cnd = seq(optPrio(str("NOT")), alt(new SQLCompare(), paren));

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}