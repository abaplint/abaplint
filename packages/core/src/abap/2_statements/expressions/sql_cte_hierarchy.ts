import {seq, optPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLAsName} from "./sql_as_name";
import {SQLCTEAssociations} from "./sql_cte_associations";
import {Release} from "../../../version";

export class SQLCTEHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Release.v751, seq(
      "HIERARCHY",
      SQLAsName,
      optPrio(seq("WITH", SQLCTEAssociations)),
    ));
  }
}
