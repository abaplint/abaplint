import {str, Expression, IStatementRunnable} from "../combi";

export class AndReturn extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("AND RETURN");
  }
}