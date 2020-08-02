import {Expression, str, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";

export class SQLHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    const having = seq(str("HAVING"), new Dynamic());
    return having;
  }
}