import {Expression, IStatementRunnable, seq, str, alt, regex} from "../combi";
import {Dynamic} from ".";

export class DatabaseConnection extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = regex(/[\w\/]+/);
    return seq(str("CONNECTION"), alt(name, new Dynamic()));
  }
}