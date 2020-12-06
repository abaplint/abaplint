import {seq, opts, stars, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seq("FROM",
                     stars(tok(WParenLeftW)),
                     SQLFromSource);

    const source = seq(from, stars(seq(opts(tok(WParenRightW)), SQLJoin, opts(tok(WParenRightW)))));

    return source;
  }
}