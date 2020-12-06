import {Expression, seqs, alts, regex} from "../combi";
import {Dynamic} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DatabaseConnection extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = regex(/[\w\/]+/);
    return seqs("CONNECTION", alts(name, Dynamic));
  }
}