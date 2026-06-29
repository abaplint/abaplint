import {seq, optPrio, starPrio, stopBefore, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";

export class SQLCreatingColumns extends Expression {
  public getRunnable(): IStatementRunnable {
    const guard = seq(stopBefore("LOCATOR", "FOR"), stopBefore("READER", "FOR"));
    return seq("COLUMNS", SQLFieldName,
               starPrio(seq(guard, optPrio(","), SQLFieldName)));
  }
}
