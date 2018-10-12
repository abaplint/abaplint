import {regex as reg, Expression, IRunnable} from "../combi";

export class MethodName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^(\/\w+\/)?\w+(~\w+)?$/);
  }
}