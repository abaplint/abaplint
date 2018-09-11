import {seq, opt, str, alt, Reuse, IRunnable} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from "./";

export class FunctionParameters extends Reuse {
  public get_runnable(): IRunnable {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let tables = seq(str("TABLES"), new ParameterListT());
    let exceptions = seq(str("EXCEPTIONS"), opt(alt(new ParameterListExceptions(), new Field())));
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(tables),
                   opt(changing),
                   opt(exceptions));

    return long;
  }
}