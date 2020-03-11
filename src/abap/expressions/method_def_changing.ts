import {str, seq, plus, IStatementRunnable, Expression} from "../combi";
import {MethodParamOptional} from ".";

export class MethodDefChanging extends Expression  {
  public getRunnable(): IStatementRunnable {
    return seq(str("CHANGING"), plus(new MethodParamOptional()));
  }
}