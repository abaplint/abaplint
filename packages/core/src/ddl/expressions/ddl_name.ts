import {Expression, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class DDLName extends Expression {
  public getRunnable(): IStatementRunnable {
    return regex(/^\w+$/);
  }
}