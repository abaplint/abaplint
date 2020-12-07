import {plus, Expression} from "../combi";
import {ParameterException} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterListExceptions extends Expression {
  public getRunnable(): IStatementRunnable {
    return plus(ParameterException);
  }
}