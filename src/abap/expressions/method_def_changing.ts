import {str, opt, seq, plus, IStatementRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefChanging extends Expression  {
  public getRunnable(): IStatementRunnable {
    return seq(str("CHANGING"), plus(seq(new MethodParam(), opt(str("OPTIONAL")))));
  }
}