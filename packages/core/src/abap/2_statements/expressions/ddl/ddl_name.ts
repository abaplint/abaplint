import {Expression, regex} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";

export class DDLName extends Expression {
  public getRunnable(): IStatementRunnable {
    return regex(/\w+/);
  }
}