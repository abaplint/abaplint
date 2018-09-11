import {regex as reg, Reuse, IRunnable} from "../combi";

export class Field extends Reuse {
  public get_runnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^[&_]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%][\w\*%]*(~\w+)?$/);
  }
}