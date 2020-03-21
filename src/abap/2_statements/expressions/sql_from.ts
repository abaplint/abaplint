import {str, seq, opt, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seq(str("FROM"),
                     star(tok(WParenLeftW)),
                     new SQLFromSource());

    const source = seq(from, star(seq(opt(tok(WParenRightW)), new SQLJoin(), opt(tok(WParenRightW)))));

    return source;
  }
}