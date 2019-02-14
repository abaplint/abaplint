import {str, Expression, IStatementRunnable} from "../combi";

export class Global extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("PUBLIC");
  }
}