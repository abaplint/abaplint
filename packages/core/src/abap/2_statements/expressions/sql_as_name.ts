import {Dash} from "../../1_lexer/tokens";
import {regex as reg, Expression, seq, optPrio, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAsName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, below allows too much?
    const field = reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?]*(~\w+)?$/);

    return seq(field, optPrio(seq(tok(Dash), field)));
  }
}