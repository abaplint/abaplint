import {seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class KernelId extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq("ID", Source, "FIELD", Source);
    return field;
  }
}