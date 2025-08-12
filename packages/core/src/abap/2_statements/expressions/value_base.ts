import {seq, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ValueBase extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("BASE", Source);
  }
}