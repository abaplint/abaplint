import {str, seq, opt, star, tok, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenRightW} from "../tokens/";
import {SQLJoin, SQLFromSource} from "./";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seq(str("FROM"),
                     star(tok(WParenLeftW)),
                     new SQLFromSource());

    const source = seq(from, star(seq(opt(tok(WParenRightW)), new SQLJoin(), opt(tok(WParenRightW)))));

    return source;
  }
}