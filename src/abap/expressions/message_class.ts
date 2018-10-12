import {regex as reg, Expression, IRunnable} from "../combi";

export class MessageClass extends Expression {
  public getRunnable(): IRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^>?(\/\w+\/)?\w+#?@?\/?!?&?>?$/);
  }
}