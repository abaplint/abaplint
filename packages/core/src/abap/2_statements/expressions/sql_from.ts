import {seq, optPrio, starPrio, tok, Expression} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    const from = seq("FROM",
                     starPrio(tok(WParenLeftW)),
                     SQLFromSource);

    const source = seq(from, starPrio(seq(optPrio(tok(WParenRightW)), SQLJoin, optPrio(tok(WParenRightW)))));

    return source;
  }
}