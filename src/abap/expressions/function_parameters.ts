import {seq, opt, str, alt, Expression, IRunnable} from "../combi";
import {ParameterListS, ParameterListT, ParameterListExceptions, Field} from "./";

export class FunctionParameters extends Expression {
  public getRunnable(): IRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const changing = seq(str("CHANGING"), new ParameterListT());
    const tables = seq(str("TABLES"), new ParameterListT());
    const exceptions = seq(str("EXCEPTIONS"), opt(alt(new ParameterListExceptions(), new Field())));
    const long = seq(opt(exporting),
                     opt(importing),
                     opt(tables),
                     opt(changing),
                     opt(exceptions));

    return long;
  }
}