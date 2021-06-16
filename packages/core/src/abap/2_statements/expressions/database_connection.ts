import {Expression, seq, regex, altPrio} from "../combi";
import {Dynamic} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DatabaseConnection extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = regex(/[\w\/]+/);
    return seq("CONNECTION", altPrio(name, Dynamic));
  }
}