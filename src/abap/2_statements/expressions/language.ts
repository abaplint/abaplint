import {str, Expression, IStatementRunnable} from "../combi";

export class Language extends Expression {
  public getRunnable(): IStatementRunnable {
    return str("LANGUAGE SQLSCRIPT");
  }
}