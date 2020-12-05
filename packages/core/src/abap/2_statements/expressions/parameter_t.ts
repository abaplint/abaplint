import {seqs, Expression} from "../combi";
import {Target, ParameterName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterT extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(ParameterName, "=", Target);
  }
}