import {seq, optPrio, altPrio, Expression, tok, starPrio} from "../combi";
import {SQLFromSource} from ".";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLJoin} from "./sql_join";

export class SQLJoinSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(
      tok(WParenLeftW),
      altPrio(new SQLJoinSource(), SQLFromSource),
      starPrio(seq(optPrio(tok(WParenRightW)), new SQLJoin())),
      optPrio(tok(WParenRightW)),
    );
    return altPrio(paren, SQLFromSource);
  }
}
