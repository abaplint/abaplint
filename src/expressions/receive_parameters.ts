import {seq, opt, str, Reuse, IRunnable} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from "./";

export class ReceiveParameters extends Reuse {
  public get_runnable(): IRunnable {
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let tables = seq(str("TABLES"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let exceptions = seq(str("EXCEPTIONS"), opt(new ParameterListExceptions()), opt(new Field()));
    let long = seq(opt(importing),
                   opt(changing),
                   opt(tables),
                   opt(exceptions));

    return long;
  }
}