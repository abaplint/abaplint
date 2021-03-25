import {seq, optPrio, altPrio, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const exceptions = seq("EXCEPTIONS", optPrio(altPrio(ParameterListExceptions, Field)));
    const long = seq(optPrio(exporting),
                     optPrio(importing),
                     optPrio(tables),
                     optPrio(changing),
                     optPrio(exceptions));

    return long;
  }
}