import {seq, starPrio, optPrio, tok, Expression, altPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  public getRunnable(): IStatementRunnable {
    // Match FROM with 0, 1, 2, or 3 levels of opening parens
    // and the corresponding closing parens
    const from0 = seq("FROM", SQLFromSource);
    const from1 = seq("FROM", tok(WParenLeftW), SQLFromSource);
    const from2 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), SQLFromSource);
    const from3 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW), SQLFromSource);

    const joins = starPrio(seq(optPrio(tok(WParenRightW)), SQLJoin));

    const close1 = seq(joins, tok(WParenRightW));
    const close2 = seq(joins, tok(WParenRightW), tok(WParenRightW));
    const close3 = seq(joins, tok(WParenRightW), tok(WParenRightW), tok(WParenRightW));

    const source = altPrio(
      seq(from3, close3),
      seq(from2, close2),
      seq(from1, close1),
      seq(from0, joins)
    );

    return source;
  }
}