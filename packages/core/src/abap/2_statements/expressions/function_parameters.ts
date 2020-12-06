import {seq, opt, alt, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const exceptions = seq("EXCEPTIONS", opt(alt(ParameterListExceptions, Field)));
    const long = seq(opt(exporting),
                     opt(importing),
                     opt(tables),
                     opt(changing),
                     opt(exceptions));

    return long;
  }
}