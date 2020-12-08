import {seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FieldSub} from "./field_sub";
import {Source} from "./source";

export class FieldAssignment extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(FieldSub, "=", Source);

    return ret;
  }
}