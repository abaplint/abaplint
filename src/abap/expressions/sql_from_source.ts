import {str, alt, seq, opt, Expression, IStatementRunnable} from "../combi";
import {SQLAsName, Dynamic, SQLCDSParameters, DatabaseTable} from "./";

export class SQLFromSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const aas = seq(str("AS"), new SQLAsName());
    return seq(alt(new Dynamic(), seq(new DatabaseTable(), opt(new SQLCDSParameters()))), opt(aas));
  }
}