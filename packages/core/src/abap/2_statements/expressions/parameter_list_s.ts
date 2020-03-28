import {plus, Expression} from "../combi";
import {ParameterS} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterListS extends Expression {
  public getRunnable(): IStatementRunnable {
    return plus(new ParameterS());
  }
}