import {plus, Expression, IStatementRunnable} from "../combi";
import {ParameterT} from "./";

export class ParameterListT extends Expression {
  public getRunnable(): IStatementRunnable {
    return plus(new ParameterT());
  }
}