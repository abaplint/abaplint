import {str, seq, IRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefReturning extends Expression  {
  public getRunnable(): IRunnable {
    return seq(str("RETURNING"), new MethodParam());
  }
}