import {Expression, regex} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";

export class DDLType extends Expression {
  public getRunnable(): IStatementRunnable {
    return regex(/\w+/);
  }
}