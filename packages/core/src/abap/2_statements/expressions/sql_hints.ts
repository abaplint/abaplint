import {seq, plus, Expression, altPrio, alt} from "../combi";
import {Constant, FieldSub} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLHints extends Expression {
  public getRunnable(): IStatementRunnable {
    const type = altPrio("ORACLE", "ADABAS", "AS400", "DB2", "HDB", "MSSQLNT", "SYBASE", "DB6", "INFORMIX");
    const ret = seq("%_HINTS", plus(seq(type, alt(Constant, FieldSub))));
    return ret;
  }
}