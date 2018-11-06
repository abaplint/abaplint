import {str, seq, plus, IRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefExporting extends Expression  {
  public getRunnable(): IRunnable {
    return seq(str("EXPORTING"), plus(new MethodParam()));
  }
}