import {seq, Expression, str, opt} from "../combi";
import {MethodParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(new MethodParam(), opt(str("OPTIONAL")));
  }

}