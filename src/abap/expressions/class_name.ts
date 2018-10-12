import {regex as reg, Expression, IRunnable} from "../combi";

export class ClassName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^\w*(\/\w{3,}\/)?\w+$/);
  }
}