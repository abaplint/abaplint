import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class FormParamName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[\w$\*%]+$/);
  }
}