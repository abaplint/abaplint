import {seq, optPrio, str, Expression} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, ParameterT} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const changing = seq(str("CHANGING"), new ParameterListT());
    const receiving = seq(str("RECEIVING"), new ParameterT());
    const exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    const long = seq(optPrio(exporting),
                     optPrio(importing),
                     optPrio(changing),
                     optPrio(receiving),
                     optPrio(exceptions));

    return long;
  }
}