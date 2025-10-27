import {seq, starPrio, optPrio, tok, Expression, altPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLJoin, SQLFromSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFrom extends Expression {
  // todo: rewrite/refactor this method
  public getRunnable(): IStatementRunnable {
    const joins = starPrio(seq(optPrio(tok(WParenRightW)), SQLJoin));

    // No opening parens
    const from0 = seq("FROM", SQLFromSource, joins);

    // 1 to 6 opening parens, with up to that many closing parens at the end
    const from1 = seq("FROM", tok(WParenLeftW), SQLFromSource, joins, optPrio(tok(WParenRightW)));

    const from2 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), SQLFromSource, joins,
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)));

    const from3 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW), SQLFromSource, joins,
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)));

    const from4 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW),
                      SQLFromSource, joins,
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)),
                      optPrio(tok(WParenRightW)));

    const from5 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW),
                      tok(WParenLeftW), SQLFromSource, joins,
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)),
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)));

    const from6 = seq("FROM", tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW), tok(WParenLeftW),
                      tok(WParenLeftW), tok(WParenLeftW), SQLFromSource, joins,
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)),
                      optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)), optPrio(tok(WParenRightW)));

    const source = altPrio(from6, from5, from4, from3, from2, from1, from0);

    return source;
  }
}