import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class ReportName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[\w/$%]+$/);
  }
}