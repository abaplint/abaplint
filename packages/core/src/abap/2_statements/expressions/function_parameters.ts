import {seq, opts, alt, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const exceptions = seq("EXCEPTIONS", opts(alt(ParameterListExceptions, Field)));
    const long = seq(opts(exporting),
                     opts(importing),
                     opts(tables),
                     opts(changing),
                     opts(exceptions));

    return long;
  }
}