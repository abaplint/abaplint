import {pluss, Expression} from "../combi";
import {ParameterT} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterListT extends Expression {
  public getRunnable(): IStatementRunnable {
    return pluss(ParameterT);
  }
}