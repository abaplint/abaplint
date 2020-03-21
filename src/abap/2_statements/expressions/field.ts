import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class Field extends Expression {
  public getRunnable(): IStatementRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^[&_!]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?#]*(~\w+)?$/);
  }
}