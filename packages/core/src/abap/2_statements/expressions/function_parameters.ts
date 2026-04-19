import {seq, optPrio, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, FunctionExporting} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {

    const exporting = seq("EXPORTING", FunctionExporting);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const exceptions = seq("EXCEPTIONS", ParameterListExceptions);
    const long = seq(optPrio(exporting),
                     optPrio(importing),
                     optPrio(tables),
                     optPrio(changing),
                     optPrio(exceptions));

    return long;
  }
}