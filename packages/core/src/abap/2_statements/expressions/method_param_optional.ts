import {seq, Expression, optPrio} from "../combi";
import {MethodParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(MethodParam, optPrio("OPTIONAL"));
  }

}