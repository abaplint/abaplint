import {regex as reg, Expression, IRunnable} from "../combi";

export class SQLFieldName extends Expression {
  public get_runnable(): IRunnable {
    return reg(/^[\w~]+$/);
  }
}