import {seq, opt, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReceiveParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seq("IMPORTING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const exceptions = seq("EXCEPTIONS", opt(ParameterListExceptions), opt(Field));
    const long = seq(opt(importing),
                     opt(changing),
                     opt(tables),
                     opt(exceptions));

    return long;
  }
}