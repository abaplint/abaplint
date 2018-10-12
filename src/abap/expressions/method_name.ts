import {regex as reg, Expression, IRunnable} from "../combi";

export class MethodName extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^(\/\w+\/)?\w+(~\w+)?$/);
  }
}