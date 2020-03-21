import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class SimpleName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[\w$%]+$/);
  }
}