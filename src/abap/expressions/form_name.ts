import {seq, opt, tok, star, regex as reg, Expression, IStatementRunnable} from "../combi";
import {Dash, DashW} from "../tokens/";

export class FormName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, does not handle namespaces properly
    return seq(reg(/^[\w%$\*\/\?]+$/),
               star(seq(tok(Dash), opt(reg(/^\w+$/)))),
               opt(tok(DashW)));
  }
}