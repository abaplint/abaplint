import {regex as reg, Expression, IRunnable} from "../combi";

export class SimpleName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^[\w$%]+$/);
  }
}