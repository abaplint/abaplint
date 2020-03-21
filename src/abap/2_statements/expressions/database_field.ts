import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class DatabaseField extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w+$/);
  }
}