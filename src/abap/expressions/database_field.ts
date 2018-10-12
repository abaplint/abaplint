import {regex as reg, Expression, IRunnable} from "../combi";

export class DatabaseField extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^\w+$/);
  }
}