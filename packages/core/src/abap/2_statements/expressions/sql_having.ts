import {Expression, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";

export class SQLHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    const having = seq("HAVING", Dynamic);
    return having;
  }
}