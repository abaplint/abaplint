import {seq, optPrio, starPrio, tok, altPrio, Expression} from "../combi";
import {WParenLeftW, WParenRightW, ParenRightW} from "../../1_lexer/tokens";
import {SQLCompare} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLCond extends Expression {
  public getRunnable(): IStatementRunnable {
    const operator = altPrio("AND", "OR");

    const paren = seq(tok(WParenLeftW),
                      SQLCond,
                      altPrio(tok(WParenRightW), tok(ParenRightW)));

    const cnd = seq(optPrio("NOT"), altPrio(SQLCompare, paren));

    const ret = seq(cnd, starPrio(seq(operator, cnd)));

    return ret;
  }
}