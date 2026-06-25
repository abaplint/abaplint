import {altPrio, seq, Expression, optPrio, ver} from "../combi";
import {SQLTarget, SQLIndicators} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIntoTable extends Expression {
  public getRunnable(): IStatementRunnable {
    const indicators = optPrio(ver(Release.v915, SQLIndicators));
    const into = seq(altPrio("INTO", "APPENDING"),
                     optPrio("CORRESPONDING FIELDS OF"),
                     "TABLE",
                     SQLTarget,
                     indicators);
    return into;
  }
}