import {str, Expression, IStatementRunnable} from "../combi";

export class ClassGlobal extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("PUBLIC");
  }
}