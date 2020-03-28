import {Expression, seq, str, alt, regex} from "../combi";
import {Dynamic} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class DatabaseConnection extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = regex(/[\w\/]+/);
    return seq(str("CONNECTION"), alt(name, new Dynamic()));
  }
}