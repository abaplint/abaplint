import {seq, str, plus, Expression, altPrio} from "../combi";
import {Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const type = altPrio(str("ORACLE"),
                         str("ADABAS"),
                         str("AS400"),
                         str("DB2"),
                         str("HDB"),
                         str("MSSQLNT"),
                         str("SYBASE"),
                         str("DB6"));
    const ret = seq(str("%_HINTS"), plus(seq(type, new Constant())));
    return ret;
  }
}