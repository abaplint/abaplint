import {altPrio, seq, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLCreatingForScope} from "./sql_creating_for_scope";

export class SQLCreatingTypeSpec extends Expression {
  public getRunnable(): IStatementRunnable {
    const kind = altPrio("LOCATOR", "READER");
    return seq(kind, SQLCreatingForScope);
  }
}
