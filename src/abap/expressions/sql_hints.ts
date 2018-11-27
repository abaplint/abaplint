import {seq, str, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./constant";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("%_HINTS"), str("ORACLE"), new Constant());
    return ret;
  }
}