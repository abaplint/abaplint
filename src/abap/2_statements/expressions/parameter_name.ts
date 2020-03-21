import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, think this can be reduced,
    return reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?]*(~\w+)?$/);
  }
}