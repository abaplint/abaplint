import {str, seq, plus, Expression} from "../combi";
import {MethodParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodDefExporting extends Expression  {
  public getRunnable(): IStatementRunnable {
    return seq(str("EXPORTING"), plus(new MethodParam()));
  }
}