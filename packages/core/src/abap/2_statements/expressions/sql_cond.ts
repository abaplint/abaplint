import {alts, seq, optPrios, stars, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = alts("AND", "OR");

    const paren = seq(tok(WParenLeftW),
                      SQLCond,
                      tok(WParenRightW));

    const cnd = seq(optPrios("NOT"), alts(SQLCompare, paren));

    const ret = seq(cnd, stars(seq(operator, cnd)));

    return ret;
  }
}