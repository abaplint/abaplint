import {seqs, tok, regex as reg, Expression, starPrio, optPrio} from "../combi";
import {Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, does not handle namespaces properly
    return seqs(reg(/^[\w%$\*\/\?]+$/),
                starPrio(seqs(tok(Dash), optPrio(reg(/^\w+$/)))),
                optPrio(tok(DashW)));
  }
}