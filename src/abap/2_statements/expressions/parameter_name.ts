import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class ParameterName extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, think this can be reduced,
    return reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?]*(~\w+)?$/);
  }
}