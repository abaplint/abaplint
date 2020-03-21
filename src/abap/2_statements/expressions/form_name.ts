import {seq, opt, tok, star, regex as reg, Expression} from "../combi";
import {Dash, DashW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class FormName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, does not handle namespaces properly
    return seq(reg(/^[\w%$\*\/\?]+$/),
               star(seq(tok(Dash), opt(reg(/^\w+$/)))),
               opt(tok(DashW)));
  }
}