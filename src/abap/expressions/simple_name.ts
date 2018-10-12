import {regex as reg, Expression, IRunnable} from "../combi";

export class SimpleName extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^[\w$%]+$/);
  }
}