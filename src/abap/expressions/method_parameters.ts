import {seq, opt, str, Expression, IRunnable} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, ParameterT} from "./";

export class MethodParameters extends Expression {
  public getRunnable(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let receiving = seq(str("RECEIVING"), new ParameterT());
    let exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(changing),
                   opt(receiving),
                   opt(exceptions));

    return long;
  }
}