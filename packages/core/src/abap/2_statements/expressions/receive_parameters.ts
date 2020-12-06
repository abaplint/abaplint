import {seq, opts, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReceiveParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seq("IMPORTING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const exceptions = seq("EXCEPTIONS", opts(ParameterListExceptions), opts(Field));
    const long = seq(opts(importing),
                     opts(changing),
                     opts(tables),
                     opts(exceptions));

    return long;
  }
}