import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLAsName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, below allows too much?
    return reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?]*(~\w+)?$/);
  }
}