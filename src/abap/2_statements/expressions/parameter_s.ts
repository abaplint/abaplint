import {str, seq, Expression} from "../combi";
import {Source, ParameterName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterS extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new ParameterName(), str("="), new Source());
  }
}