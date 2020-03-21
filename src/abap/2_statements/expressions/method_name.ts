import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class MethodName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(\/\w+\/)?\w+(~\w+)?$/);
  }
}