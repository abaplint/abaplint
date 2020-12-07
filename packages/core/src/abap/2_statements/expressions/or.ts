import {seq, Expression} from "../combi";
import {Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Or extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("OR", Source);
  }
}