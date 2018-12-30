import {str, seq, Expression, IStatementRunnable} from "../combi";
import {Source, ParameterName} from "./";

export class ParameterS extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new ParameterName(), str("="), new Source());
  }
}