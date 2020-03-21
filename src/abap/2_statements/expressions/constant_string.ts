import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class ConstantString extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^('.*')|(`.*`)$/);
  }
}