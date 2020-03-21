import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class MessageClass extends Expression {
  public getRunnable(): IStatementRunnable {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^>?(\/\w+\/)?\w+#?@?\/?!?&?>?$/);
  }
}