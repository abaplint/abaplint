import {seq, pluss, Expression, altPrios} from "../combi";
import {Constant} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const type = altPrios("ORACLE", "ADABAS", "AS400", "DB2", "HDB", "MSSQLNT", "SYBASE", "DB6");
    const ret = seq("%_HINTS", pluss(seq(type, Constant)));
    return ret;
  }
}