import {Dash, DashW} from "../../1_lexer/tokens";
import {regex as reg, Expression, seq, starPrio, tok, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class MessageClass extends Expression {
  public getRunnable(): IStatementRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return seq(reg(/^>?[\w\/]+#?@?\/?!?&?>?\$?\??$/), starPrio(seq(tok(Dash), optPrio(reg(/^\w+$/)))), optPrio(tok(DashW)));
  }
}