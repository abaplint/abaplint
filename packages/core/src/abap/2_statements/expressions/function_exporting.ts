import {Expression, plusPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FunctionExportingParameter} from ".";

export class FunctionExporting extends Expression {
  public getRunnable(): IStatementRunnable {

    const exp = plusPrio(FunctionExportingParameter);

    return exp;
  }
}