import {seq, opt, star, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seq("FROM",
                     star(tok(WParenLeftW)),
                     SQLFromSource);

    const source = seq(from, star(seq(opt(tok(WParenRightW)), SQLJoin, opt(tok(WParenRightW)))));

    return source;
  }
}