import {str, seq, IStatementRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefReturning extends Expression  {
  public getRunnable(): IStatementRunnable {
    return seq(str("RETURNING"), new MethodParam());
  }
}