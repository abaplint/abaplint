import {seqs, Expression} from "../combi";
import {MethodName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {MethodCallParam} from "./method_call_param";

export class MethodCall extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seqs(MethodName, MethodCallParam);
    return ret;
  }
}