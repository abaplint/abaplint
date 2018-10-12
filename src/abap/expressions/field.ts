import {regex as reg, Expression, IRunnable} from "../combi";

export class Field extends Expression {
  public get_runnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^[&_]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%\$][\w\*%\$\?]*(~\w+)?$/);
  }
}