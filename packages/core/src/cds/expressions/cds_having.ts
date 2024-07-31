import {CDSCondition} from ".";
import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("HAVING", CDSCondition);
  }
}