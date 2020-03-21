import {plus, Expression, IStatementRunnable} from "../combi";
import {ParameterException} from ".";

export class ParameterListExceptions extends Expression {
  public getRunnable(): IStatementRunnable {
    return plus(new ParameterException());
  }
}