import {seq, tok, regex as reg, Expression, starPrios, optPrio} from "../combi";
import {Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, does not handle namespaces properly
    return seq(reg(/^[\w%$\*\/\?]+$/),
               starPrios(seq(tok(Dash), optPrio(reg(/^\w+$/)))),
               optPrio(tok(DashW)));
  }
}