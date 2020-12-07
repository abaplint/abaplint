import {alt, seq, optPrio, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alt("AND", "OR");

    const paren = seq(tok(WParenLeftW),
                      SQLCond,
                      tok(WParenRightW));

    const cnd = seq(optPrio("NOT"), alt(SQLCompare, paren));

    const ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}