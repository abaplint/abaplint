import {seq, str, plus, Expression, IStatementRunnable} from "../combi";
import {Constant} from "./constant";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("%_HINTS"), plus(seq(str("ORACLE"), new Constant())));
    return ret;
  }
}