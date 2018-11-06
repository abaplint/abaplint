import {str, opt, seq, plus, IRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefChanging extends Expression  {
  public getRunnable(): IRunnable {
    return seq(str("CHANGING"), plus(seq(new MethodParam(), opt(str("OPTIONAL")))));
  }
}