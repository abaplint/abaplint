import {regex as reg, Expression, IRunnable} from "../combi";

export class DatabaseTable extends Expression {
  public getRunnable(): IRunnable {
    return reg(/^(\/\w+\/)?\w+$/);
  }
}