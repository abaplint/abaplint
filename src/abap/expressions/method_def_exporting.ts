import {str, seq, plus, IStatementRunnable, Expression} from "../combi";
import {MethodParam} from ".";

export class MethodDefExporting extends Expression  {
  public getRunnable(): IStatementRunnable {
    return seq(str("EXPORTING"), plus(new MethodParam()));
  }
}