import {seq, opt, str, Expression, IStatementRunnable} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, ParameterT} from "./";

export class MethodParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const changing = seq(str("CHANGING"), new ParameterListT());
    const receiving = seq(str("RECEIVING"), new ParameterT());
    const exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    const long = seq(opt(exporting),
                     opt(importing),
                     opt(changing),
                     opt(receiving),
                     opt(exceptions));

    return long;
  }
}