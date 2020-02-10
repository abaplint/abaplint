import {seq, str, plus, Expression, IStatementRunnable, altPrio} from "../combi";
import {Constant} from "./";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const ret = seq(str("%_HINTS"), plus(seq(altPrio(str("ORACLE"), str("DB6")), new Constant())));
    return ret;
  }
}