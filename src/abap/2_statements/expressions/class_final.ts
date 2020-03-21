import {str, Expression, IStatementRunnable} from "../combi";

export class ClassFinal extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("FINAL");
  }
}