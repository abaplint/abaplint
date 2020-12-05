import {Expression, seqs} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";

export class SQLHaving extends Expression {
  public getRunnable(): IStatementRunnable {
    const having = seqs("HAVING", Dynamic);
    return having;
  }
}