import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EventName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?#]*(~\w+)?$/);
  }
}