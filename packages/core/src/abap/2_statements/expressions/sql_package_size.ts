import {seq, Expression} from "../combi";
import {SQLSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLPackageSize extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("PACKAGE SIZE", SQLSource);
  }
}
