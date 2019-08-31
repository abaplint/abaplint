import {str, Expression, IStatementRunnable} from "../combi";

export class Abstract extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("ABSTRACT");
  }
}