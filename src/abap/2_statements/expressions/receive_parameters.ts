import {seq, opt, str, Expression} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ReceiveParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const tables = seq(str("TABLES"), new ParameterListT());
    const changing = seq(str("CHANGING"), new ParameterListT());
    const exceptions = seq(str("EXCEPTIONS"), opt(new ParameterListExceptions()), opt(new Field()));
    const long = seq(opt(importing),
                     opt(changing),
                     opt(tables),
                     opt(exceptions));

    return long;
  }
}