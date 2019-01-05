import {str, seq, Expression, IStatementRunnable} from "../combi";
import {Target, ParameterName} from "./";

export class ParameterT extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new ParameterName(), str("="), new Target());
  }
}