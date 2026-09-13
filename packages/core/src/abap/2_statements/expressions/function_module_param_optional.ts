import {seq, optPrio, Expression} from "../combi";
import {FunctionModuleParam} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModuleParamOptional extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(FunctionModuleParam, optPrio("OPTIONAL"));
  }

}
