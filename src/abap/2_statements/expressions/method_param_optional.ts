import {seq, Expression, str, opt, IStatementRunnable} from "../combi";
import {MethodParam} from ".";

export class MethodParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new MethodParam(), opt(str("OPTIONAL")));
  }

}